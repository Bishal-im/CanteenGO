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
    const { name, location, is_active } = req.body;
    const cafeteria = await Cafeteria.create({ name, location, is_active });
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

    // Find cafeteria owned by this admin
    const cafeteria = await Cafeteria.findOne({ adminId: req.user._id });
    if (!cafeteria) return res.status(404).json({ message: 'No cafeteria found for this admin' });

    if (cafeteria.canteenCode) {
      return res.status(400).json({ message: 'Canteen code is already set' });
    }

    cafeteria.canteenCode = canteenCode.trim().toUpperCase();
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
