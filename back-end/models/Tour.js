const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: { type: String, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  deadline: { type: Date, required: true },
  max_capacity: { type: Number, required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leader_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'confirmed', 'completed'], default: 'draft' },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Tour', tourSchema);
