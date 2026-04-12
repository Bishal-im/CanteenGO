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
    if (!req.user) {
      return res.status(401).json({ message: 'User object not found in request' });
    }

    let user = await User.findById(req.user._id).select('-password').populate('cafeteriaId', 'name canteenCode');
    
    // AUTO-LINK LOGIC for Admins
    if (user && !user.cafeteriaId) {
        const Cafeteria = require('../models/Cafeteria');
        const ownedCafeteria = await Cafeteria.findOne({ adminEmail: user.email.toLowerCase().trim() });
        
        if (ownedCafeteria) {
            console.log(`[Auth] Auto-linking ${user.email} to canteen ${ownedCafeteria.name}`);
            user.role = 'admin';
            user.cafeteriaId = ownedCafeteria._id;
            await user.save();
            
            ownedCafeteria.adminId = user._id;
            await ownedCafeteria.save();
            
            // Re-populate after link
            user = await User.findById(req.user._id).select('-password').populate('cafeteriaId', 'name canteenCode');
        }
    }

    if (user) {
      // Issue separate secure cookies based on role
      const isPrivileged = user.role === 'admin' || user.role === 'superadmin';
      const cookieName = isPrivileged ? 'cg_admin_session' : 'cg_customer_session';
      const token = req.headers.authorization?.split(' ')[1];

      if (token) {
        res.cookie(cookieName, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', 
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
      }

      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('[Controller] Profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, faculty } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (faculty) user.faculty = faculty;
    
    // Mark profile as complete if name is provided (minimum requirement)
    if (user.name) user.isProfileComplete = true;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user and clear cookies
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  res.clearCookie('cg_customer_session');
  res.clearCookie('cg_admin_session');
  res.status(200).json({ message: 'Logged out successfully, session cleared' });
};

