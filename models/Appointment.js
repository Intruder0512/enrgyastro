const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },

    mode: { type: String, enum: ['online', 'offline'], required: true },
    date: { type: Date, required: true },
    slot: { type: String, required: true }, // e.g. "10:00 AM - 10:30 AM"

    // Snapshot of birth details at time of booking (so later profile edits don't alter past bookings)
    birthDetailsSnapshot: {
      dob: Date,
      tob: String,
      pob: String,
      latitude: Number,
      longitude: Number
    },

    concern: { type: String, trim: true },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid'
    },
    paymentRef: { type: String },
    amount: { type: Number, required: true },

    adminNotes: { type: String } // private notes, only visible to admin
  },
  { timestamps: true }
);

appointmentSchema.index({ date: 1, slot: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
