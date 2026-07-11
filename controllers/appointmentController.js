const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { sendMail, bookingConfirmationEmail, adminBookingNotificationEmail } = require('../utils/mailer');

function toDateOnly(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function isBlocked(settings, dateStr) {
  return settings.blockedDates.find((b) => toDateOnly(b.date) === dateStr);
}

exports.showBookingForm = async (req, res) => {
  const services = await Service.find({ isActive: true }).sort('category name');
  const preselect = req.query.service || null;
  res.render('booking/new', { title: 'Book a Consultation', services, preselect, errors: [] });
};

exports.getAvailableSlots = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.json({ slots: [] });

  const settings = await Settings.getSingleton();
  const blocked = isBlocked(settings, date);
  if (blocked) {
    return res.json({ slots: [], blocked: true, reason: blocked.reason || 'This date is unavailable for booking.' });
  }

  const taken = await Appointment.find({
    date: new Date(date),
    status: { $in: ['pending', 'confirmed'] }
  }).select('slot');

  const takenSlots = new Set(taken.map((a) => a.slot));
  const available = settings.slots.filter((s) => !takenSlots.has(s));

  res.json({ slots: available, blocked: false });
};

exports.createBooking = async (req, res) => {
  const { serviceId, mode, date, slot, concern, dob, tob, pob, latitude, longitude } = req.body;

  const service = await Service.findById(serviceId);
  if (!service) return res.status(400).send('Invalid service selected.');

  const settings = await Settings.getSingleton();
  if (isBlocked(settings, date)) {
    return res.status(409).send('That date is unavailable for booking. Please pick another date.');
  }
  if (!settings.slots.includes(slot)) {
    return res.status(400).send('Invalid time slot selected.');
  }

  const clash = await Appointment.findOne({
    date: new Date(date),
    slot,
    status: { $in: ['pending', 'confirmed'] }
  });
  if (clash) {
    return res.status(409).send('That slot was just booked by someone else. Please pick another.');
  }

  const appointment = await Appointment.create({
    user: req.session.userId,
    service: service._id,
    mode,
    date: new Date(date),
    slot,
    concern,
    birthDetailsSnapshot: { dob, tob, pob, latitude, longitude },
    amount: service.price
  });

  // Keep the user's profile birth details up to date for future bookings/reports
  const user = await User.findByIdAndUpdate(
    req.session.userId,
    { birthDetails: { dob, tob, pob, latitude, longitude } },
    { new: true }
  );

  // Email confirmations — never block the booking flow if SMTP fails
  const userEmail = bookingConfirmationEmail({ user, appointment, service });
  sendMail({ to: user.email, subject: `Booking Confirmed — ${service.name}`, ...userEmail });

  if (process.env.ADMIN_EMAIL) {
    const adminEmail = adminBookingNotificationEmail({ user, appointment, service });
    sendMail({ to: process.env.ADMIN_EMAIL, subject: `New Booking: ${service.name}`, ...adminEmail });
  }

  res.redirect(`/dashboard/appointments/${appointment._id}/confirmation`);
};

exports.showConfirmation = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate('service');
  if (!appointment || String(appointment.user) !== String(req.session.userId)) {
    return res.status(404).render('error', { title: 'Not found', message: 'Appointment not found.' });
  }
  res.render('booking/confirmation', { title: 'Booking Confirmed', appointment });
};

exports.myAppointments = async (req, res) => {
  const appointments = await Appointment.find({ user: req.session.userId })
    .populate('service')
    .sort('-date');
  res.render('dashboard/appointments', { title: 'My Appointments', appointments });
};
