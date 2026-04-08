const mongoose = require('mongoose');

const cafeteriaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  is_active: { type: Boolean, default: true },
  canteenCode: { type: String, unique: true, sparse: true },
  adminEmail: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timeSlots: { type: [String], default: ["10:15", "11:30", "12:45", "14:00"] },
  paymentQRUrl: { type: String },
}, { timestamps: true });

const Cafeteria = mongoose.model('Cafeteria', cafeteriaSchema);
module.exports = Cafeteria;
