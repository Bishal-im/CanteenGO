const express = require('express');
const { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.get('/', getMenuItems);
router.post('/', protect, admin, upload.single('image'), createMenuItem);
router.put('/:id', protect, admin, updateMenuItem);
router.delete('/:id', protect, admin, deleteMenuItem);

module.exports = router;
