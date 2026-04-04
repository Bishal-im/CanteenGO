const express = require('express');
const { register, verifyOtp, login, getProfile, getStats, getUsers, updateUserRole } = require('../controllers/authController');
const { protect, admin } = require('../middlewares/authMiddleware');
const router = express.Router();

// router.post('/register', register);
// router.post('/verify', verifyOtp);
// router.post('/login', login);
router.get('/profile', protect, getProfile);
router.get('/stats', protect, admin, getStats);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
