const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// Définition des routes
router.get('/', tripController.getAllTrips);       // GET /trips
router.post('/:id/remix', tripController.remixTrip); // POST /trips/:id/remix

module.exports = router;