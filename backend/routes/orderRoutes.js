const express = require('express');
const { createOrder, getMyOrders, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.post('/', protect, upload.single('image'), createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/', protect, admin, getOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
