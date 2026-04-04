const express = require('express');
const { getCafeterias, createCafeteria, updateCafeteria } = require('../controllers/cafeteriasController');
const { protect, admin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', getCafeterias);
router.post('/', protect, admin, createCafeteria);
router.put('/:id', protect, admin, updateCafeteria);

module.exports = router;
