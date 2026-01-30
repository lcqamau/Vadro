const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createReview,
  getReviewsByTrip,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createReview).get(getReviewsByTrip);

const reviewRouter = express.Router();
reviewRouter.route('/:id').put(protect, updateReview).delete(protect, deleteReview);

module.exports = { router, reviewRouter };
