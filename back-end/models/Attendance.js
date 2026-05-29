const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  itinerary_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', required: true },
  membership_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', required: true },
  status: { type: String, enum: ['present', 'absent'], default: 'present' },
  recorded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true }, // The vehicle this attendance was taken for
}, { timestamps: true });

// Ensure one record per passenger per itinerary
attendanceSchema.index({ itinerary_id: 1, membership_id: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
