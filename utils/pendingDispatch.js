const astroController = require('../controllers/astroController');
const extraAstroController = require('../controllers/extraAstroController');
const doshaChartController = require('../controllers/doshaChartController');
const vedicToolsController = require('../controllers/vedicToolsController');

// Named calculators that have their own dedicated form/result views
const NAMED_HANDLERS = {
  kundli: astroController.generateKundli,
  matching: astroController.generateMatching,
  numerology: extraAstroController.calculateNumerology,
  dosha: doshaChartController.checkDosha,
  chart: doshaChartController.generateChart
};

// Called right after a session is established (register or login). If the
// person arrived here because gateResult() intercepted a form submission,
// this replays that submission and renders the result directly — so the
// account-creation step doesn't cost them re-entering their birth details.
// Returns true if it handled the response (caller must not respond again).
async function dispatchPending(req, res) {
  const pending = req.session.pendingSubmission;
  if (!pending) return false;

  delete req.session.pendingSubmission;
  delete req.session.authNotice;
  req.body = pending.body || {};

  if (pending.handlerKey && pending.handlerKey.startsWith('tool:')) {
    req.params = req.params || {};
    req.params.type = pending.handlerKey.slice(5);
    await vedicToolsController.submitForm(req, res);
    return true;
  }

  const handler = NAMED_HANDLERS[pending.handlerKey];
  if (handler) {
    await handler(req, res);
    return true;
  }

  return false;
}

module.exports = dispatchPending;
