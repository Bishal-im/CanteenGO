const express = require('express');
const { getCafeterias, createCafeteria, updateCafeteria, deleteCafeteria, setupCanteenCode, joinCafeteria, getCafeteriaByCode } = require('../controllers/cafeteriasController');
const { protect, admin, superAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', getCafeterias);
router.post('/setup', protect, admin, setupCanteenCode);
router.post('/join', protect, joinCafeteria);
router.get('/code/:code', protect, getCafeteriaByCode);

// Category Management (Admin)
const { getCategories, updateCategories } = require('../controllers/cafeteriasController');
router.get('/my/categories', protect, admin, getCategories);
router.put('/my/categories', protect, admin, updateCategories);

router.post('/', protect, superAdmin, createCafeteria);
router.put('/:id', protect, superAdmin, updateCafeteria);
router.delete('/:id', protect, superAdmin, deleteCafeteria);

module.exports = router;
