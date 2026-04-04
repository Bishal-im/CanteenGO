const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }
    }
  ],
  total_amount: { type: Number, required: true },
  time_slot: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'rejected'], default: 'pending' },
  payment_screenshot_url: { type: String },
  remarks: { type: String }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
