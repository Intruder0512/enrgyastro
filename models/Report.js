const mongoose = require('mongoose');

// Caches results from the Prokerala API so a user isn't re-charged in
// credits for viewing the same Kundli/Matching/Panchang report twice.
const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['kundli', 'panchang', 'matching', 'dosha', 'dasha', 'numerology', 'chart', 'tool'],
      required: true
    },
    inputHash: { type: String, required: true, index: true }, // hash of request params, for cache lookups
    requestParams: { type: mongoose.Schema.Types.Mixed },
    responseData: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
