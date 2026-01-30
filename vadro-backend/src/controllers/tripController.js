const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Fonction pour REMIXER un voyage
exports.remixTrip = async (req, res) => {
  const tripId = parseInt(req.params.id);
  const newAuthorId = parseInt(req.body.newAuthorId);

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

// 2. Fonction pour RÉCUPÉRER tous les voyages (pour ton Feed plus tard)
exports.getAllTrips = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { isPublic: true },
      include: { author: true }
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des voyages" });
  }
};