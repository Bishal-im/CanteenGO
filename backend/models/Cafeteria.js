const mongoose = require('mongoose');

const cafeteriaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

const Cafeteria = mongoose.model('Cafeteria', cafeteriaSchema);
module.exports = Cafeteria;
