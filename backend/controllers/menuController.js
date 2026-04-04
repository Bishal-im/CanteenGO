const MenuItem = require('../models/MenuItem');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all menu items
// @route   GET /api/menu
exports.getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create menu item (handles image upload)
// @route   POST /api/menu
exports.createMenuItem = async (req, res) => {
  try {
    const { name, price, category, cafeteria_id } = req.body;
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
      category,
      cafeteria_id,
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
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
