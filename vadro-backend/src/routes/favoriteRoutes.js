const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
// 👇 ON RÉACTIVE CECI
const { protect } = require('../middleware/authMiddleware'); 

// On remet 'protect' ici
router.post('/:tripId', protect, favoriteController.toggleFavorite);
router.get('/', protect, favoriteController.getMyFavorites);
router.get('/:tripId/check', protect, favoriteController.checkFavoriteStatus);

module.exports = router;