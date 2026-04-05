const mongoose = require('mongoose');

const adminWhitelistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
    default: null,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const AdminWhitelist = mongoose.model('AdminWhitelist', adminWhitelistSchema);
module.exports = AdminWhitelist;
