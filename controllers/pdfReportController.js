const prokerala = require('../utils/prokerala');

exports.showForm = (req, res) => res.render('astro/pdf-report-form', { title: 'PDF Astrology Report', error: null });

exports.generate = async (req, res) => {
  const { firstName, middleName, lastName, gender, dob, tob, place, lat, lng } = req.body;
  const datetime = `${dob}T${tob}:00+05:30`;

  const input = {
    first_name: firstName,
    middle_name: middleName || '',
    last_name: lastName,
    datetime,
    coordinates: `${lat},${lng}`,
    place: place || '',
    gender
  };

  // Fixed bundle: birth details, chart, planet positions, doshas, yogas, dasha —
  // a solid general-purpose personal report. Prokerala supports many more
  // module combinations; this is the sensible default for a first release.
  const options = {
    modules: [
      { name: 'birth-details' },
      { name: 'chart', options: { chart_style: 'south-indian' } },
      { name: 'planet-position' },
      { name: 'mangal-dosha', options: { chart_style: 'south-indian' } },
      { name: 'kaal-sarp-dosha', options: { chart_style: 'south-indian' } },
      { name: 'sade-sati', options: { chart_style: 'south-indian' } },
      { name: 'yoga-details' },
      { name: 'planet-relationship' },
      { name: 'dasa-periods' }
    ],
    template: {
      style: 'basic',
      footer: 'EnrgyAstro — enrgyastro.com'
    },
    report: {
      name: `${firstName} ${lastName} — Astrology Report`,
      caption: 'Personal Astrology Report',
      brand_name: 'EnrgyAstro'
    }
  };

  try {
    const pdfBuffer = await prokerala.getPersonalPdfReport(input, options);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="EnrgyAstro-Report-${lastName || 'report'}.pdf"`
    });
    return res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error('PDF report error:', err.response?.data ? JSON.stringify(err.response.data) : err.message);
    return res.render('astro/pdf-report-form', {
      title: 'PDF Astrology Report',
      error: 'Could not generate the report right now. Please try again shortly.'
    });
  }
};
