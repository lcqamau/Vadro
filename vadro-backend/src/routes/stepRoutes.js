const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createStep,
  getStepsByTrip,
  updateStep,
  deleteStep,
} = require('../controllers/stepController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createStep).get(getStepsByTrip);

const stepRouter = express.Router();
stepRouter.route('/:id').put(protect, updateStep).delete(protect, deleteStep);

module.exports = { router, stepRouter };
