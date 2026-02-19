const prisma = require('../config/db');

// @desc    Créer un nouveau voyage
// @route   POST /api/trips
// @access  Privé
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
    originalTripId, // Ajout du support pour les Remixes
    startDate,
    endDate,
    status
  } = req.body;
  const authorId = req.user.id; 

  // Validation basique des types numériques avant insertion
  const parsedDistance = parseFloat(distanceKm);
  const parsedDuration = parseInt(durationDays);
  const parsedBudget = parseFloat(budgetEuro);

  if (isNaN(parsedDistance) || isNaN(parsedDuration) || isNaN(parsedBudget)) {
      return res.status(400).json({ message: "Les champs distance, durée et budget doivent être des nombres." });
  }

  try {
    const newTrip = await prisma.trip.create({
      data: {
        title,
        description,
        distanceKm: parsedDistance,
        durationDays: parsedDuration,
        budgetEuro: parsedBudget,
        imageUrl,
        tags,
        isPublic: isPublic === true || isPublic === 'true', 
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status: status || 'PLANNED',
        originalTrip: originalTripId ? { connect: { id: parseInt(originalTripId) } } : undefined, // Lien vers l'original via relation
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
    console.error("Erreur création voyage:", error);
    res.status(500).json({ message: "Erreur lors de la création du voyage.", details: error.message });
  }
};

// @desc    Obtenir tous les voyages (publics uniquement)
// @route   GET /api/trips
// @access  Public
// @desc    Obtenir tous les voyages (publics uniquement) ou filtrés par zone géographique
// @route   GET /api/trips
// @access  Public
const getAllTrips = async (req, res) => {
  try {
    const { minLat, maxLat, minLng, maxLng } = req.query;

    const whereClause = { isPublic: true };

    // Filtrage géographique si les paramètres sont présents
    if (minLat && maxLat && minLng && maxLng) {
        const minLatNum = parseFloat(minLat);
        const maxLatNum = parseFloat(maxLat);
        const minLngNum = parseFloat(minLng);
        const maxLngNum = parseFloat(maxLng);

        if (!isNaN(minLatNum) && !isNaN(maxLatNum) && !isNaN(minLngNum) && !isNaN(maxLngNum)) {
            whereClause.steps = {
                some: {
                    latitude: { gte: minLatNum, lte: maxLatNum },
                    longitude: { gte: minLngNum, lte: maxLngNum }
                }
            };
        }
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
      include: { 
        author: true,
        steps: {
          take: 1, // On a juste besoin de la première étape pour la carte
          orderBy: { orderIndex: 'asc' }
        }
      },
    });
    res.json(trips);
  } catch (error) {
    console.error("Erreur récupération voyages:", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des voyages.' });
  }
};

// @desc    Obtenir un voyage par ID
// @route   GET /api/trips/:id
// @access  Public (mais filtre les infos privées si nécessaire)
const getTripById = async (req, res) => {
  const tripId = parseInt(req.params.id);

  if (isNaN(tripId)) {
      return res.status(400).json({ message: "ID de voyage invalide." });
  }

  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        steps: {
            orderBy: { orderIndex: 'asc' } // Tri des étapes par ordre croissant
        },
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
        // Si le voyage est privé, on vérifie si l'utilisateur est l'auteur (si authentifié)
        // Note: req.user peut être undefined si la route est publique sans middleware auth optionnel
        if (!trip.isPublic && (!req.user || req.user.id !== trip.authorId)) {
             return res.status(403).json({ message: "Accès refusé : Ce voyage est privé." });
        }
      res.json(trip);
    } else {
      res.status(404).json({ message: 'Voyage introuvable.' });
    }
  } catch (error) {
    console.error("Erreur récupération voyage par ID:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du voyage." });
  }
};

// @desc    Mettre à jour un voyage
// @route   PUT /api/trips/:id
// @access  Privé
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
    startDate,
    endDate,
    status
  } = req.body;
  const userId = req.user.id;

  if (isNaN(tripId)) {
      return res.status(400).json({ message: "ID de voyage invalide." });
  }

  // Validation basique des types numériques pour update
  // On utilise 'undefined' si la valeur n'est pas fournie pour ne pas écraser par NaN
  const parsedDistance = distanceKm !== undefined ? parseFloat(distanceKm) : undefined;
  const parsedDuration = durationDays !== undefined ? parseInt(durationDays) : undefined;
  const parsedBudget = budgetEuro !== undefined ? parseFloat(budgetEuro) : undefined;
  
  if ((distanceKm !== undefined && isNaN(parsedDistance)) || 
      (durationDays !== undefined && isNaN(parsedDuration)) || 
      (budgetEuro !== undefined && isNaN(parsedBudget))) {
      return res.status(400).json({ message: "Les champs numériques (distance, durée, budget) sont invalides." });
  }

  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Voyage introuvable.' });
    }

    if (trip.authorId !== userId) {
      return res.status(403).json({ message: 'Non autorisé à modifier ce voyage.' });
    }

    // Utilisation d'une transaction pour garantir l'atomicité (suppression étapes + mise à jour voyage)
    const updatedTrip = await prisma.$transaction(async (prismaTx) => {
        // 1. Supprimer les anciennes étapes
        await prismaTx.step.deleteMany({
            where: { tripId: tripId },
        });

        // 2. Mettre à jour le voyage et créer les nouvelles étapes
        return await prismaTx.trip.update({
            where: { id: tripId },
            data: {
                title,
                description,
                distanceKm: parsedDistance, // Si undefined, Prisma ignore le champ
                durationDays: parsedDuration,
                budgetEuro: parsedBudget,
                imageUrl,
                tags, // Assurez-vous que tags est un tableau ou format compatible JSON/String selon votre schéma
                isPublic: isPublic !== undefined ? (isPublic === true || isPublic === 'true') : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                status: status || undefined,
                steps: {
                    create: steps, // Recrée toutes les étapes
                },
            },
            include: {
                steps: {
                    orderBy: { orderIndex: 'asc' }
                },
                author: true,
            },
        });
    });

    res.json(updatedTrip);
  } catch (error) {
    console.error("Erreur mise à jour voyage:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du voyage." });
  }
};

// @desc    Supprimer un voyage
// @route   DELETE /api/trips/:id
// @access  Privé
const deleteTrip = async (req, res) => {
  const tripId = parseInt(req.params.id);
  const userId = req.user.id;

  if (isNaN(tripId)) {
      return res.status(400).json({ message: "ID de voyage invalide." });
  }

  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Voyage introuvable.' });
    }

    if (trip.authorId !== userId) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce voyage.' });
    }

    // 1. Dissocier les remixes qui dépendent de ce voyage pour éviter l'erreur de clé étrangère
    await prisma.trip.updateMany({
      where: { originalTripId: tripId },
      data: { originalTripId: null }
    });

    // 2. Supprimer le voyage (les étapes/favoris/avis sont supprimés via Cascade défini dans le schéma)
    await prisma.trip.delete({
      where: { id: tripId },
    });

    res.json({ message: 'Voyage supprimé avec succès.' });
  } catch (error) {
    console.error("Erreur suppression voyage:", error);
    res.status(500).json({ message: "Erreur lors de la suppression du voyage." });
  }
};

// @desc    Obtenir les voyages d'un utilisateur
// @route   GET /api/trips/user/:userId
// @access  Public (pour les voyages publics), Privé (pour tous si c'est l'auteur qui demande)
const getTripsByUser = async (req, res) => {
  const targetUserId = parseInt(req.params.userId);
  // req.user peut être indéfini si la route est accessible sans authentification obligatoire
  const requesterId = req.user ? req.user.id : null;

  if (isNaN(targetUserId)) {
      return res.status(400).json({ message: "ID utilisateur invalide." });
  }

  try {
    const whereClause = {
        authorId: targetUserId
    };

    // Si celui qui demande n'est pas le propriétaire du profil, on ne montre que les publics
    if (requesterId !== targetUserId) {
        whereClause.isPublic = true;
    }
    // Sinon (requesterId === targetUserId), on ne filtre pas sur isPublic, donc on retourne tout.

    const trips = await prisma.trip.findMany({
      where: whereClause,
      include: {
        author: true,
      },
    });
    res.json(trips);
  } catch (error) {
    console.error("Erreur récupération voyages utilisateur:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des voyages de l'utilisateur." });
  }
};

// @desc    Remixer un voyage
// @route   POST /api/trips/:id/remix
// @access  Privé
const remixTrip = async (req, res) => {
    const tripId = parseInt(req.params.id);
    const newAuthorId = req.user.id;
  
    if (isNaN(tripId) || isNaN(newAuthorId)) {
      return res.status(400).json({ message: "ID voyage ou utilisateur invalide ou manquant." });
    }
  
    try {
      // Vérification user
      const userExists = await prisma.user.findUnique({ where: { id: newAuthorId } });
      if (!userExists) return res.status(404).json({ message: "Utilisateur introuvable." });
  
      // Récupération voyage original
      const originalTrip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { steps: true },
      });

      if (!originalTrip) return res.status(404).json({ message: "Voyage original introuvable." });
      
      // Vérifier si le voyage original est privé et que l'utilisateur n'est pas l'auteur
      if (!originalTrip.isPublic && originalTrip.authorId !== newAuthorId) {
          return res.status(403).json({ message: "Impossible de remixer un voyage privé qui ne vous appartient pas." });
      }
  
      // Copie des étapes (sans copier les IDs pour que la DB en génère de nouveaux)
      const stepsData = originalTrip.steps.map((step) => ({
        orderIndex: step.orderIndex,
        title: step.title,
        description: step.description,
        latitude: step.latitude,
        longitude: step.longitude,
        type: step.type,
        imageUrl: step.imageUrl,
        // Ne pas copier 'id', 'tripId', 'createdAt', 'updatedAt'
      }));
  
      // Création du Remix dans une transaction implicite via create
      const remixTrip = await prisma.trip.create({
        data: {
          title: `${originalTrip.title} (Remix)`,
          description: originalTrip.description,
          distanceKm: originalTrip.distanceKm,
          durationDays: originalTrip.durationDays,
          budgetEuro: originalTrip.budgetEuro,
          imageUrl: originalTrip.imageUrl,
          tags: originalTrip.tags,
          isPublic: false, // Par défaut privé après un remix
          originalTripId: originalTrip.id, // Lien vers l'original si votre schéma le supporte
          authorId: newAuthorId,
          steps: { create: stepsData },
        },
        include: {
            steps: { orderBy: { orderIndex: 'asc' } },
            author: true
        }
      });
  
      res.status(201).json({ success: true, remix: remixTrip });
  
    } catch (error) {
      console.error("Erreur Remix:", error);
      res.status(500).json({ message: "Erreur serveur lors du remix du voyage.", details: error.message });
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
