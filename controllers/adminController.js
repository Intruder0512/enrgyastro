const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Service = require('../models/Service');

function toCsvField(value) {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function toCsv(rows, fields) {
  const header = fields.join(',');
  const body = rows.map((row) => fields.map((f) => toCsvField(row[f])).join(',')).join('\n');
  return header + '\n' + body;
}

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

exports.showNewServiceForm = (req, res) => {
  res.render('admin/service-form', { title: 'Add New Service', service: null, errors: [] });
};

exports.createService = async (req, res) => {
  const { name, category, description, shortDescription, price, durationMinutes, mode } = req.body;
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    await Service.create({
      name,
      slug,
      category,
      description,
      shortDescription,
      price: Number(price) || 0,
      durationMinutes: Number(durationMinutes) || 30,
      mode: Array.isArray(mode) ? mode : [mode].filter(Boolean),
      isActive: true
    });
    res.redirect('/admin/services');
  } catch (err) {
    res.status(400).render('admin/service-form', {
      title: 'Add New Service',
      service: req.body,
      errors: [{ msg: err.code === 11000 ? 'A service with a similar name already exists.' : err.message }]
    });
  }
};

exports.showEditServiceForm = async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.status(404).render('error', { title: 'Not Found', message: 'Service not found.' });
  res.render('admin/service-form', { title: 'Edit Service', service, errors: [] });
};

exports.updateService = async (req, res) => {
  const { name, category, description, shortDescription, price, durationMinutes, mode } = req.body;

  try {
    await Service.findByIdAndUpdate(req.params.id, {
      name,
      category,
      description,
      shortDescription,
      price: Number(price) || 0,
      durationMinutes: Number(durationMinutes) || 30,
      mode: Array.isArray(mode) ? mode : [mode].filter(Boolean)
    });
    res.redirect('/admin/services');
  } catch (err) {
    const service = await Service.findById(req.params.id);
    res.status(400).render('admin/service-form', {
      title: 'Edit Service',
      service: { ...service.toObject(), ...req.body },
      errors: [{ msg: err.message }]
    });
  }
};

exports.toggleService = async (req, res) => {
  const service = await Service.findById(req.params.id);
  service.isActive = !service.isActive;
  await service.save();
  res.redirect('/admin/services');
};

// ---- Appointments CSV export ----

exports.exportAppointmentsCsv = async (req, res) => {
  const appointments = await Appointment.find().populate('user service').sort('-date');
  const rows = appointments.map((a) => ({
    date: a.date.toISOString().slice(0, 10),
    slot: a.slot,
    service: a.service?.name || '',
    user_name: a.user?.name || '',
    user_email: a.user?.email || '',
    user_phone: a.user?.phone || '',
    mode: a.mode,
    status: a.status,
    payment_status: a.paymentStatus,
    amount: a.amount,
    concern: a.concern || ''
  }));

  const fields = ['date', 'slot', 'service', 'user_name', 'user_email', 'user_phone', 'mode', 'status', 'payment_status', 'amount', 'concern'];
  const csv = toCsv(rows, fields);

  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': `attachment; filename="enrgyastro-appointments-${new Date().toISOString().slice(0, 10)}.csv"`
  });
  res.send(csv);
};

// ---- Admin account settings ----

exports.showSettings = (req, res) => {
  res.render('admin/settings', { title: 'Admin Settings', errors: [], success: null });
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const admin = await User.findById(req.session.userId);

  if (!(await admin.comparePassword(currentPassword))) {
    return res.status(400).render('admin/settings', {
      title: 'Admin Settings',
      errors: [{ msg: 'Current password is incorrect.' }],
      success: null
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).render('admin/settings', {
      title: 'Admin Settings',
      errors: [{ msg: 'New password must be at least 6 characters.' }],
      success: null
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).render('admin/settings', {
      title: 'Admin Settings',
      errors: [{ msg: 'New password and confirmation do not match.' }],
      success: null
    });
  }

  admin.password = newPassword;
  await admin.save();

  res.render('admin/settings', { title: 'Admin Settings', errors: [], success: 'Password updated successfully.' });
};
