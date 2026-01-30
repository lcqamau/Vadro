const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Create a new step for a trip
// @route   POST /api/trips/:tripId/steps
// @access  Private
const createStep = async (req, res) => {
  const tripId = parseInt(req.params.tripId);
  const { orderIndex, name, description, latitude, longitude, type, imageUrl } = req.body;
  const userId = req.user.id;

  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.authorId !== userId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const newStep = await prisma.step.create({
      data: {
        orderIndex,
        name,
        description,
        latitude,
        longitude,
        type,
        imageUrl,
        trip: { connect: { id: tripId } },
      },
    });

    res.status(201).json(newStep);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all steps for a trip
// @route   GET /api/trips/:tripId/steps
// @access  Public
const getStepsByTrip = async (req, res) => {
  const tripId = parseInt(req.params.tripId);

  try {
    const steps = await prisma.step.findMany({
      where: { tripId: tripId },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    res.json(steps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a step
// @route   PUT /api/steps/:id
// @access  Private
const updateStep = async (req, res) => {
  const stepId = parseInt(req.params.id);
  const { orderIndex, name, description, latitude, longitude, type, imageUrl } = req.body;
  const userId = req.user.id;

  try {
    const step = await prisma.step.findUnique({
      where: { id: stepId },
      include: { trip: true },
    });

    if (!step) {
      return res.status(404).json({ message: 'Step not found' });
    }

    if (step.trip.authorId !== userId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedStep = await prisma.step.update({
      where: { id: stepId },
      data: {
        orderIndex,
        name,
        description,
        latitude,
        longitude,
        type,
        imageUrl,
      },
    });

    res.json(updatedStep);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a step
// @route   DELETE /api/steps/:id
// @access  Private
const deleteStep = async (req, res) => {
  const stepId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const step = await prisma.step.findUnique({
      where: { id: stepId },
      include: { trip: true },
    });

    if (!step) {
      return res.status(404).json({ message: 'Step not found' });
    }

    if (step.trip.authorId !== userId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await prisma.step.delete({
      where: { id: stepId },
    });

    res.json({ message: 'Step removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
    createStep,
    getStepsByTrip,
    updateStep,
    deleteStep,
};
