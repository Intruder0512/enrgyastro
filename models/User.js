const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Birth details, reused across Kundli / Panchang / Matching requests
    birthDetails: {
      dob: { type: Date },
      tob: { type: String }, // HH:mm
      pob: { type: String }, // place of birth (free text)
      latitude: { type: Number },
      longitude: { type: Number },
      timezone: { type: String, default: 'Asia/Kolkata' },
      gender: { type: String, enum: ['male', 'female', 'other'] }
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
