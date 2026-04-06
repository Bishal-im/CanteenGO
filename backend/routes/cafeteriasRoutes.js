const express = require('express');
const { getCafeterias, createCafeteria, updateCafeteria, setupCanteenCode, joinCafeteria, getCafeteriaByCode } = require('../controllers/cafeteriasController');
const { protect, admin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', getCafeterias);
router.post('/setup', protect, admin, setupCanteenCode);
router.post('/join', protect, joinCafeteria);
router.get('/code/:code', protect, getCafeteriaByCode);
router.post('/', protect, admin, createCafeteria);
router.put('/:id', protect, admin, updateCafeteria);

module.exports = router;
