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

// Anyone can view/fill a calculator form. Submitting it (to actually
// generate a result) requires an account — this stashes the submitted
// data in the session and sends them to register/login first, then
// replays the request once they're authenticated (see utils/pendingDispatch.js).
function gateResult(key) {
  return (req, res, next) => {
    if (req.session && req.session.userId) return next();
    const resolvedKey = typeof key === 'function' ? key(req) : key;
    req.session.pendingSubmission = { handlerKey: resolvedKey, body: req.body, params: req.params };
    req.session.authNotice = 'Create a free account (or log in) to view your result — it only takes a few seconds.';
    return res.redirect('/register');
  };
}

module.exports = { requireAuth, requireAdmin, attachUser, gateResult };
