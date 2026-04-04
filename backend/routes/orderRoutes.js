const express = require('express');
const { createOrder, getMyOrders, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/', protect, admin, getOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
