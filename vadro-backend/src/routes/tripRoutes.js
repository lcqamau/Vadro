const express = require('express');
const router = express.Router();
const {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripsByUser,
  remixTrip,
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { router: stepRouter } = require('./stepRoutes');
const { router: reviewRouter } = require('./reviewRoutes');

router.use('/:tripId/steps', stepRouter);
router.use('/:tripId/reviews', reviewRouter);

router.route('/').post(protect, createTrip).get(getAllTrips);

router
  .route('/:id')
  .get(getTripById)
  .put(protect, updateTrip)
  .delete(protect, deleteTrip);

router.route('/user/:userId').get(getTripsByUser);

router.route('/:id/remix').post(protect, remixTrip);

module.exports = router;
