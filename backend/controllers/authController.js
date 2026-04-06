const User = require('../models/User');
const AdminWhitelist = require('../models/AdminWhitelist');

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
    const user = await User.findById(req.user._id).select('-password').populate('cafeteriaId', 'name canteenCode');
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
        console.log(`[Auth] Issued ${cookieName} cookie for ${user.email}`);
      }

    res.json(user);
    } else {
      res.status(404).json({ message: 'User not found in database' });
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

// ─────────────────────────────────────────────
// Admin Whitelist Management (SuperAdmin Only)
// ─────────────────────────────────────────────

// @desc    Add email to admin whitelist
// @route   POST /api/auth/admins
exports.addAdmin = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already whitelisted
    const existing = await AdminWhitelist.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'This email is already an admin' });

    // Add to whitelist
    const entry = await AdminWhitelist.create({
      email: normalizedEmail,
      name: name?.trim() || null,
      addedBy: req.user._id,
    });

    // If user already exists in the system, upgrade them immediately
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.role === 'customer') {
      existingUser.role = 'admin';
      if (name && !existingUser.name) existingUser.name = name.trim();
      await existingUser.save();
      console.log(`[Whitelist] Upgraded existing user ${normalizedEmail} to admin`);
    }

    res.status(201).json({ message: `${normalizedEmail} added as admin`, entry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all whitelisted admins
// @route   GET /api/auth/admins
exports.getAdmins = async (req, res) => {
  try {
    const admins = await AdminWhitelist.find().sort({ createdAt: -1 });
    // Enrich with live user status
    const enriched = await Promise.all(admins.map(async (a) => {
      const user = await User.findOne({ email: a.email }).select('name role');
      return {
        _id: a._id,
        email: a.email,
        name: a.name || user?.name || null,
        hasAccount: !!user,
        role: user?.role || null,
        createdAt: a.createdAt,
      };
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove email from admin whitelist
// @route   DELETE /api/auth/admins/:email
exports.removeAdmin = async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase().trim();
    await AdminWhitelist.findOneAndDelete({ email });

    // Demote user if they exist
    const user = await User.findOne({ email });
    if (user && user.role === 'admin') {
      user.role = 'customer';
      await user.save();
      console.log(`[Whitelist] Demoted ${email} to customer`);
    }

    res.json({ message: `${email} removed from admin whitelist` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
