// Session-based auth (matches the pattern used for the ICAS LMS admin login)

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  req.session.returnTo = req.originalUrl;
  return res.redirect('/login');
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.userId && req.session.role === 'admin') return next();
  return res.status(403).render('error', { title: 'Forbidden', message: 'Admin access only.' });
}

// Makes current user available to all views without repeating lookups in every route
function attachUser(req, res, next) {
  res.locals.currentUser = req.session.userId
    ? { id: req.session.userId, name: req.session.name, role: req.session.role }
    : null;
  next();
}

module.exports = { requireAuth, requireAdmin, attachUser };
