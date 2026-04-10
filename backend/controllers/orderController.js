const Order = require('../models/Order');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, total_amount, time_slot, remarks } = req.body;
    
    // Parse items if it's a string (due to multipart/form-data)
    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;

    if (!req.user.cafeteriaId) {
      return res.status(400).json({ message: 'Please join a canteen first before ordering.' });
    }

    let payment_screenshot_url = '';

    if (req.file) {
        payment_screenshot_url = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ folder: 'canteengo/receipts' }, (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }).end(req.file.buffer);
        });
    }

    const order = await Order.create({
      customer_id: req.user._id,
      cafeteria_id: req.user.cafeteriaId,
      items: parsedItems,
      total_amount,
      time_slot,
      payment_screenshot_url,
      remarks,
      status: 'pending'
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('[Order] Create error:', error);
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

// @desc    Get all orders (for admin - filtered by cafeteria)
// @route   GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const Cafeteria = require('../models/Cafeteria');
    const cafeteria = await Cafeteria.findOne({ adminId: req.user._id });
    
    if (!cafeteria) {
      return res.json([]);
    }

    const orders = await Order.find({ cafeteria_id: cafeteria._id })
      .populate('customer_id', 'name email faculty')
      .sort({ createdAt: -1 });
      
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
