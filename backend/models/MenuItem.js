const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  image_url: { type: String },
  is_available: { type: Boolean, default: true },
  cafeteria_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cafeteria' }
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = MenuItem;
