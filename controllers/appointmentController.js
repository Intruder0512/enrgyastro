const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');

// Fixed daily slots for a solo practitioner. Kept simple and hardcoded for
// Phase 1 — a real availability calendar (with blocked-out days) is Phase 2.
const DAILY_SLOTS = [
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:30 AM - 12:00 PM',
  '12:00 PM - 12:30 PM',
  '04:00 PM - 04:30 PM',
  '04:30 PM - 05:00 PM',
  '05:00 PM - 05:30 PM',
  '06:00 PM - 06:30 PM'
];

exports.showBookingForm = async (req, res) => {
  const services = await Service.find({ isActive: true }).sort('category name');
  const preselect = req.query.service || null;
  res.render('booking/new', { title: 'Book a Consultation', services, preselect, errors: [] });
};

exports.getAvailableSlots = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.json({ slots: [] });

  const taken = await Appointment.find({
    date: new Date(date),
    status: { $in: ['pending', 'confirmed'] }
  }).select('slot');

  const takenSlots = new Set(taken.map((a) => a.slot));
  const available = DAILY_SLOTS.filter((s) => !takenSlots.has(s));

  res.json({ slots: available });
};

exports.createBooking = async (req, res) => {
  const { serviceId, mode, date, slot, concern, dob, tob, pob, latitude, longitude } = req.body;

  const service = await Service.findById(serviceId);
  if (!service) return res.status(400).send('Invalid service selected.');

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
  await User.findByIdAndUpdate(req.session.userId, {
    birthDetails: { dob, tob, pob, latitude, longitude }
  });

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

module.exports.DAILY_SLOTS = DAILY_SLOTS;
