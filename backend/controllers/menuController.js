const MenuItem = require('../models/MenuItem');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all menu items (filtered by cafeteria)
// @route   GET /api/menu
exports.getMenuItems = async (req, res) => {
  try {
    const Cafeteria = require('../models/Cafeteria');
    let query = {};

    if (req.user.role === 'customer') {
      if (!req.user.cafeteriaId) return res.json([]);
      query.cafeteria_id = req.user.cafeteriaId;
    } else if (req.user.role === 'admin') {
      const cafeteria = await Cafeteria.findOne({ adminId: req.user._id });
      if (!cafeteria) return res.json([]);
      query.cafeteria_id = cafeteria._id;
    } else {
      // Superadmins see nothing for now per user request
      return res.json([]);
    }

    const items = await MenuItem.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create menu item (handles image upload)
// @route   POST /api/menu
exports.createMenuItem = async (req, res) => {
  try {
    const Cafeteria = require('../models/Cafeteria');
    const { name, price, category, description } = req.body;
    
    // Auto-link to admin's cafeteria
    const cafeteria = await Cafeteria.findOne({ adminId: req.user._id });
    if (!cafeteria) {
      return res.status(403).json({ message: 'Authorization error: No cafeteria linked to this admin account' });
    }

    let image_url = '';

    if (req.file) {
      // Upload using stream to Cloudinary
      image_url = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'canteengo/menu' }, (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }).end(req.file.buffer);
      });
    }

    const item = await MenuItem.create({
      name,
      price,
      description,
      category,
      cafeteria_id: cafeteria._id,
      image_url
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, price, category, description, is_available } = req.body;
    let updateData = { name, price, category, description, is_available };

    // Handle image upload if a new file is provided
    if (req.file) {
      updateData.image_url = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'canteengo/menu' }, (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }).end(req.file.buffer);
      });
    }

    // Clean updateData (remove undefined/empty fields)
    Object.keys(updateData).forEach(key => (updateData[key] === undefined || updateData[key] === '') && delete updateData[key]);

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
exports.deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
