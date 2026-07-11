const prokerala = require('../utils/prokerala');
const Report = require('../models/Report');
const TOOLS = require('../utils/vedicTools');
const crypto = require('crypto');

function hashParams(prefix, obj) {
  return crypto.createHash('md5').update(prefix + JSON.stringify(obj)).digest('hex');
}

exports.showToolsIndex = (req, res) => {
  res.render('tools', { title: 'All Astrology Tools', tools: TOOLS });
};

exports.showForm = (req, res) => {
  const tool = TOOLS[req.params.type];
  if (!tool) return res.status(404).render('error', { title: 'Not Found', message: 'Unknown calculator.' });
  res.render('astro/tool-form', { title: tool.label, tool, type: req.params.type });
};

exports.submitForm = async (req, res) => {
  const type = req.params.type;
  const tool = TOOLS[type];
  if (!tool) return res.status(404).render('error', { title: 'Not Found', message: 'Unknown calculator.' });

  const { dob, tob, lat, lng } = req.body;
  const datetime = `${dob}T${tob || '00:00'}:00+05:30`;
  const params = { type, dob, tob, lat, lng };
  const inputHash = hashParams('tool', params);

  try {
    const cached = req.session.userId
      ? await Report.findOne({ type: 'tool', inputHash, user: req.session.userId })
      : null;

    let result;
    if (cached) {
      result = cached.responseData;
    } else {
      result = tool.isSvg
        ? { svg: await prokerala.callGenericSvg(tool.path, lat, lng, datetime) }
        : { data: (await prokerala.callGeneric(tool.path, lat, lng, datetime)).data };

      if (req.session.userId) {
        await Report.create({
          user: req.session.userId,
          type: 'tool',
          inputHash,
          requestParams: params,
          responseData: result
        });
      }
    }

    res.render('astro/tool-result', { title: tool.label, tool, result, error: null });
  } catch (err) {
    console.error(`Vedic tool (${type}) error:`, err.message);
    res.render('astro/tool-result', { title: tool.label, tool, result: null, error: 'Could not generate this report right now. Please try again shortly.' });
  }
};
