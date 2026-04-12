const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['customer', 'admin', 'superadmin'], default: 'customer' },
  faculty: { type: String },
  cafeteriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cafeteria' },
  isProfileComplete: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
