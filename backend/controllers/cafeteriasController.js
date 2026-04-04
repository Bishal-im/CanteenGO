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
