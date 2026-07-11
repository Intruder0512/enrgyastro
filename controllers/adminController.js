const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Service = require('../models/Service');

exports.dashboard = async (req, res) => {
  const [pendingCount, todayCount, totalUsers, upcoming] = await Promise.all([
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    }),
    User.countDocuments({ role: 'user' }),
    Appointment.find({ date: { $gte: new Date() }, status: { $in: ['pending', 'confirmed'] } })
      .populate('user service')
      .sort('date')
      .limit(10)
  ]);

  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    stats: { pendingCount, todayCount, totalUsers },
    upcoming
  });
};

exports.listAppointments = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const appointments = await Appointment.find(filter)
    .populate('user service')
    .sort('-date');

  res.render('admin/appointments', { title: 'All Appointments', appointments, filter: req.query.status || '' });
};

exports.updateAppointmentStatus = async (req, res) => {
  const { status, adminNotes } = req.body;
  await Appointment.findByIdAndUpdate(req.params.id, { status, adminNotes });
  res.redirect('/admin/appointments');
};

exports.listUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).sort('-createdAt');

  const appointmentCounts = await Appointment.aggregate([
    { $group: { _id: '$user', count: { $sum: 1 } } }
  ]);
  const countMap = new Map(appointmentCounts.map((a) => [String(a._id), a.count]));

  const usersWithCounts = users.map((u) => ({
    ...u.toObject(),
    appointmentCount: countMap.get(String(u._id)) || 0
  }));

  res.render('admin/users', { title: 'Registered Users', users: usersWithCounts });
};

exports.viewUserCalendar = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).render('error', { title: 'Not Found', message: 'User not found.' });

  const appointments = await Appointment.find({ user: user._id }).populate('service').sort('date');
  res.render('admin/user-calendar', { title: `${user.name}'s Bookings`, viewedUser: user, appointments });
};

exports.listServices = async (req, res) => {
  const services = await Service.find().sort('category name');
  res.render('admin/services', { title: 'Manage Services', services });
};

exports.toggleService = async (req, res) => {
  const service = await Service.findById(req.params.id);
  service.isActive = !service.isActive;
  await service.save();
  res.redirect('/admin/services');
};
