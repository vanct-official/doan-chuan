const mongoose = require('mongoose');
const { normalizePhone } = require('../utils/phoneUtils');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String }, // Optional for Google Auth users
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google Auth users
  googleId: { type: String, unique: true, sparse: true }, // unique and sparse so it ignores null/undefined
  dob: { type: Date },
  gender: { type: Boolean }, // true for male, false for female
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Chuẩn hóa số điện thoại trước khi lưu
userSchema.pre('save', function(next) {
  if (this.phone) {
    this.phone = normalizePhone(this.phone);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
