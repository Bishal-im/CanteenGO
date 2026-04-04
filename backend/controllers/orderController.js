const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, total_amount, time_slot, payment_screenshot_url, remarks } = req.body;
    
    const order = await Order.create({
      customer_id: req.user._id,
      items,
      total_amount,
      time_slot,
      payment_screenshot_url,
      remarks,
      status: 'pending'
    });



    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user orders (for customer)
// @route   GET /api/orders/myorders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer_id: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (for admin)
// @route   GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customer_id', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();


    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
