const User = require('../models/User');
const { validationResult } = require('express-validator');
const dispatchPending = require('../utils/pendingDispatch');

function readNotice(req) {
  return req.session.authNotice || null;
}

exports.showRegister = (req, res) =>
  res.render('auth/register', { title: 'Create Account', errors: [], old: {}, notice: readNotice(req) });

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('auth/register', {
      title: 'Create Account',
      errors: errors.array(),
      old: req.body,
      notice: null
    });
  }

  const { name, email, phone, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).render('auth/register', {
      title: 'Create Account',
      errors: [{ msg: 'An account with this email already exists.' }],
      old: req.body,
      notice: null
    });
  }

  let user;
  try {
    user = await User.create({ name, email, phone, password });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).render('auth/register', {
        title: 'Create Account',
        errors: [{ msg: 'An account with this email already exists.' }],
        old: req.body,
        notice: null
      });
    }
    throw err;
  }

  req.session.userId = user._id;
  req.session.name = user.name;
  req.session.role = user.role;

  const handled = await dispatchPending(req, res);
  if (handled) return;

  res.redirect('/dashboard');
};

exports.showLogin = (req, res) =>
  res.render('auth/login', { title: 'Login', errors: [], notice: readNotice(req) });

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(400).render('auth/login', {
      title: 'Login',
      errors: [{ msg: 'Invalid email or password.' }],
      notice: null
    });
  }

  req.session.userId = user._id;
  req.session.name = user.name;
  req.session.role = user.role;

  const handled = await dispatchPending(req, res);
  if (handled) return;

  const dest = req.session.returnTo || (user.role === 'admin' ? '/admin' : '/dashboard');
  delete req.session.returnTo;
  res.redirect(dest);
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};
