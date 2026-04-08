const express = require('express');
const { getCafeterias, createCafeteria, updateCafeteria, setupCanteenCode, joinCafeteria, getCafeteriaByCode } = require('../controllers/cafeteriasController');
const { protect, admin, superAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', getCafeterias);
router.post('/setup', protect, admin, setupCanteenCode);
router.post('/join', protect, joinCafeteria);
router.get('/code/:code', protect, getCafeteriaByCode);
router.post('/', protect, superAdmin, createCafeteria);
router.put('/:id', protect, superAdmin, updateCafeteria);

module.exports = router;
