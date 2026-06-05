const mongoose = require('mongoose');
const { normalizePhone } = require('../utils/phoneUtils');

const membershipSchema = new mongoose.Schema({
  tour_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  phone: { type: String }, // Lưu phone ở cấp cao nhất để dễ truy vấn và đánh index
  is_guest: { type: Boolean, default: false },
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

// Đảm bảo mỗi số điện thoại chỉ xuất hiện 1 lần trong 1 tour (nếu phone tồn tại)
membershipSchema.index(
  { tour_id: 1, phone: 1 }, 
  { unique: true, partialFilterExpression: { phone: { $exists: true, $type: "string" } } }
);

membershipSchema.pre('validate', function(next) {
  // Đồng bộ phone từ guest_info nếu chưa có ở root
  if (!this.phone && this.guest_info && this.guest_info.phone) {
    this.phone = this.guest_info.phone;
  }
  // Chuẩn hóa số điện thoại
  if (this.phone) {
    this.phone = normalizePhone(this.phone);
    if (this.guest_info) {
      this.guest_info.phone = this.phone; // Giữ đồng bộ
    }
  }

  // Tự động xác định is_guest
  this.is_guest = !this.user_id;

  if (!this.user_id && (!this.guest_info || !this.guest_info.name)) {
    next(new Error('Membership must belong to a registered user or contain guest info with a name.'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Membership', membershipSchema);
