const Cafeteria = require('../models/Cafeteria');

// @desc    Get all cafeterias
// @route   GET /api/cafeterias
exports.getCafeterias = async (req, res) => {
  try {
    const cafeterias = await Cafeteria.find().sort({ name: 1 });
    res.json(cafeterias);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create cafeteria
// @route   POST /api/cafeterias
exports.createCafeteria = async (req, res) => {
  try {
    const { name, location, adminEmail, is_active } = req.body;
    if (!adminEmail) return res.status(400).json({ message: 'Admin email is required' });

    const email = adminEmail.toLowerCase().trim();

    // Create cafeteria
    const cafeteria = await Cafeteria.create({ 
      name, 
      location, 
      adminEmail: email, 
      is_active 
    });

    // If a user with this email already exists, link them now
    const User = require('../models/User');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        existingUser.role = 'admin';
        existingUser.cafeteriaId = cafeteria._id;
        await existingUser.save();
        
        cafeteria.adminId = existingUser._id;
        await cafeteria.save();
        console.log(`[Cafeteria] Pre-linked existing user ${email} to ${name}`);
    }

    res.status(201).json(cafeteria);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cafeteria
// @route   PUT /api/cafeterias/:id
exports.updateCafeteria = async (req, res) => {
  try {
    const cafeteria = await Cafeteria.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cafeteria);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Setup canteen code (Admin only)
// @route   POST /api/cafeterias/setup
exports.setupCanteenCode = async (req, res) => {
  try {
    const { canteenCode } = req.body;
    if (!canteenCode) return res.status(400).json({ message: 'Canteen code is required' });

    // Find cafeteria owned by this admin (using email match for robustness)
    const cafeteria = await Cafeteria.findOne({ 
        $or: [
            { adminId: req.user._id },
            { adminEmail: req.user.email.toLowerCase() }
        ]
    });

    if (!cafeteria) return res.status(404).json({ message: 'No cafeteria found for this admin' });

    cafeteria.canteenCode = canteenCode.trim().toUpperCase();
    
    // Ensure back-link is established if it wasn't before
    if (!cafeteria.adminId) {
        cafeteria.adminId = req.user._id;
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, { cafeteriaId: cafeteria._id });
    }

    await cafeteria.save();

    res.json({ message: 'Canteen code setup successful', cafeteria });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cafeteria by code
// @route   GET /api/cafeterias/code/:code
exports.getCafeteriaByCode = async (req, res) => {
  try {
    const cafeteria = await Cafeteria.findOne({ canteenCode: req.params.code.toUpperCase() });
    if (!cafeteria) return res.status(404).json({ message: 'Invalid canteen code' });
    res.json(cafeteria);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a cafeteria (Student)
// @route   POST /api/cafeterias/join
exports.joinCafeteria = async (req, res) => {
  try {
    const { canteenCode } = req.body;
    const User = require('../models/User');

    const cafeteria = await Cafeteria.findOne({ canteenCode: canteenCode.trim().toUpperCase() });
    if (!cafeteria) return res.status(404).json({ message: 'Invalid canteen code' });

    const user = await User.findById(req.user._id);
    user.cafeteriaId = cafeteria._id;
    await user.save();

    res.json({ message: `Successfully joined ${cafeteria.name}`, cafeteria });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin's cafeteria categories
// @route   GET /api/cafeterias/my/categories
exports.getCategories = async (req, res) => {
  try {
    const cafeteria = await Cafeteria.findOne({ adminId: req.user._id });
    if (!cafeteria) return res.status(404).json({ message: 'No cafeteria found' });
    res.json(cafeteria.categories || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admin's cafeteria categories
// @route   PUT /api/cafeterias/my/categories
exports.updateCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
        return res.status(400).json({ message: 'Categories must be an array of strings' });
    }

    const cafeteria = await Cafeteria.findOne({ adminId: req.user._id });
    if (!cafeteria) return res.status(404).json({ message: 'No cafeteria found' });

    cafeteria.categories = categories;
    await cafeteria.save();
    res.json({ message: 'Categories updated', categories: cafeteria.categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Delete cafeteria
// @route   DELETE /api/cafeterias/:id
exports.deleteCafeteria = async (req, res) => {
  try {
    const cafeteria = await Cafeteria.findById(req.params.id);
    if (!cafeteria) return res.status(404).json({ message: 'No cafeteria found' });

    // Clean up links in User model
    const User = require('../models/User');
    await User.updateMany({ cafeteriaId: cafeteria._id }, { cafeteriaId: null });

    await cafeteria.deleteOne();
    res.json({ message: 'Cafeteria removed from the grid' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
