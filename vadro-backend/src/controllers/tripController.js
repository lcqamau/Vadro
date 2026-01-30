const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  const {
    title,
    description,
    distanceKm,
    durationDays,
    budgetEuro,
    imageUrl,
    tags,
    isPublic,
    steps,
  } = req.body;
  const authorId = req.user.id;

  try {
    const newTrip = await prisma.trip.create({
      data: {
        title,
        description,
        distanceKm,
        durationDays,
        budgetEuro,
        imageUrl,
        tags,
        isPublic,
        author: { connect: { id: authorId } },
        steps: {
          create: steps,
        },
      },
      include: {
        steps: true,
        author: true,
      },
    });
    res.status(201).json(newTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
const getAllTrips = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { isPublic: true },
      include: { author: true },
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des voyages' });
  }
};

// @desc    Get a trip by ID
// @route   GET /api/trips/:id
// @access  Public
const getTripById = async (req, res) => {
  const tripId = parseInt(req.params.id);

  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        steps: true,
        author: true,
        reviews: {
          include: {
            user: true,
          },
        },
        favorites: true,
      },
    });

    if (trip) {
      res.json(trip);
    } else {
      res.status(404).json({ message: 'Trip not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = async (req, res) => {
  const tripId = parseInt(req.params.id);
  const {
    title,
    description,
    distanceKm,
    durationDays,
    budgetEuro,
    imageUrl,
    tags,
    isPublic,
    steps,
  } = req.body;
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

    // Delete existing steps
    await prisma.step.deleteMany({
      where: { tripId: tripId },
    });

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        title,
        description,
        distanceKm,
        durationDays,
        budgetEuro,
        imageUrl,
        tags,
        isPublic,
        steps: {
          create: steps,
        },
      },
      include: {
        steps: true,
        author: true,
      },
    });

    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
  const tripId = parseInt(req.params.id);
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

    await prisma.trip.delete({
      where: { id: tripId },
    });

    res.json({ message: 'Trip removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trips by user
// @route   GET /api/trips/user/:userId
// @access  Public
const getTripsByUser = async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const trips = await prisma.trip.findMany({
      where: {
        authorId: userId,
        isPublic: true,
      },
      include: {
        author: true,
      },
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remix a trip
// @route   POST /api/trips/:id/remix
// @access  Private
const remixTrip = async (req, res) => {
    const tripId = parseInt(req.params.id);
    const newAuthorId = req.user.id;
  
    if (isNaN(newAuthorId)) {
      return res.status(400).json({ error: "ID utilisateur invalide ou manquant" });
    }
  
    try {
      // Vérification user
      const userExists = await prisma.user.findUnique({ where: { id: newAuthorId } });
      if (!userExists) return res.status(404).json({ error: "Utilisateur introuvable" });
  
      // Récupération voyage original
      const originalTrip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { steps: true },
      });
      if (!originalTrip) return res.status(404).json({ error: "Voyage introuvable" });
  
      // Copie des étapes
      const stepsData = originalTrip.steps.map((step) => ({
        orderIndex: step.orderIndex,
        name: step.name,
        description: step.description,
        latitude: step.latitude,
        longitude: step.longitude,
        type: step.type,
        imageUrl: step.imageUrl,
      }));
  
      // Création du Remix
      const remixTrip = await prisma.trip.create({
        data: {
          title: `${originalTrip.title} (Remix)`,
          description: originalTrip.description,
          distanceKm: originalTrip.distanceKm,
          durationDays: originalTrip.durationDays,
          budgetEuro: originalTrip.budgetEuro,
          imageUrl: originalTrip.imageUrl,
          tags: originalTrip.tags,
          isPublic: false,
          originalTripId: originalTrip.id,
          authorId: newAuthorId,
          steps: { create: stepsData },
        },
      });
  
      res.json({ success: true, remix: remixTrip });
  
    } catch (error) {
      console.error("Erreur Remix:", error);
      res.status(500).json({ error: "Erreur serveur", details: error.message });
    }
  };

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripsByUser,
  remixTrip,
};
