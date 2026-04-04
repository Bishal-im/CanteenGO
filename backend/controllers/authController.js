const User = require('../models/User');

// @desc    Get system stats
// @route   GET /api/auth/stats
exports.getStats = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const Cafeteria = require('../models/Cafeteria');
    const orders = await Order.find();
    const canteens = await Cafeteria.countDocuments();
    const users = await User.countDocuments();

    const revenue = orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

    res.json({
      orders: orders.length,
      canteens,
      users,
      revenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role (superadmin only)
// @route   PUT /api/auth/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = req.body.role;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get user profile
// @route   GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    console.log('[Controller] getProfile called');
    console.log('[Controller] User model defined:', !!User);
    console.log('[Controller] req.user defined:', !!req.user);
    if (!req.user) {
      return res.status(401).json({ message: 'User object not found in request' });
    }
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found in database' });
    }
  } catch (error) {
    console.error('[Controller] Profile error:', error);
    res.status(500).json({ message: error.message });
  }
};
