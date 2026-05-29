const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
  tour_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  hotel_name: { type: String, required: true },
  room_number: { type: String, required: true },
  assigned_members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Membership' }]
}, { timestamps: true });

module.exports = mongoose.model('Accommodation', accommodationSchema);
