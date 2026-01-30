const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Create a new review for a trip
// @route   POST /api/trips/:tripId/reviews
// @access  Private
const createReview = async (req, res) => {
  const tripId = parseInt(req.params.tripId);
  const { rating, comment } = req.body;
  const userId = req.user.id;

  try {
    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        trip: { connect: { id: tripId } },
        user: { connect: { id: userId } },
      },
      include: {
        user: true,
      },
    });

    res.status(201).json(newReview);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'You have already reviewed this trip' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a trip
// @route   GET /api/trips/:tripId/reviews
// @access  Public
const getReviewsByTrip = async (req, res) => {
  const tripId = parseInt(req.params.tripId);

  try {
    const reviews = await prisma.review.findMany({
      where: { tripId: tripId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  const reviewId = parseInt(req.params.id);
  const { rating, comment } = req.body;
  const userId = req.user.id;

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment,
      },
      include: {
        user: true,
      },
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  const reviewId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getReviewsByTrip,
  updateReview,
  deleteReview,
};
