const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cafeteria_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cafeteria', required: true },
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
  paymentName: { type: String },
  hiddenFromCustomer: { type: Boolean, default: false },
  remarks: { type: String }
}, { timestamps: true });

// TTL index to automatically remove the order after 24 hours (86400 seconds)
orderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
