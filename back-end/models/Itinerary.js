const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  tour_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  activity: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);
