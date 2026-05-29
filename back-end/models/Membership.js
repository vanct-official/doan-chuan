const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  tour_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  guest_info: {
    name: { type: String },
    phone: { type: String },
    birth_year: { type: Number },
    gender: { type: String }
  },
  role: {
    type: String,
    enum: ['leader', 'group_rep', 'vehicle_rep', 'driver', 'member'],
    default: 'member'
  },
  is_driver: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'removed', 'left'],
    default: 'pending'
  },
  customer_type: {
    type: String,
    enum: ['adult', 'child', 'elderly'],
    default: 'adult'
  },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
  vehicle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
  note: { type: String },
  leave_reason: { type: String }
}, { timestamps: true });

membershipSchema.pre('validate', function(next) {
  if (!this.user_id && (!this.guest_info || !this.guest_info.name)) {
    next(new Error('Membership must belong to a registered user or contain guest info with a name.'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Membership', membershipSchema);
