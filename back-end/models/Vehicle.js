const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  tour_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  license_plate: { type: String, required: true },
  plate_color: { type: String },
  seat_count: { type: Number, required: true },
  image_url: { type: String },
  driver_name: { type: String },
  driver_phone: { type: String },
  representative_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership' }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
