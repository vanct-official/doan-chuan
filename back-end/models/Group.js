const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  tour_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
  name: { type: String, required: true },
  representative_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership' }
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
