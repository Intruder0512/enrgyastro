// Express 4 does not catch rejected promises from async route handlers —
// an uncaught rejection (e.g. a slow/unreachable DB) crashes the whole
// process instead of hitting the error middleware. Wrap every async
// controller with this so failures render the error page instead.
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
