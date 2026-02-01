const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Ajouter ou Retirer un favori (Toggle)
// @route   POST /api/favorites/:tripId
// @access  Private (ou Public avec ID temporaire)
const toggleFavorite = async (req, res) => {
  const tripId = parseInt(req.params.tripId);
  
  // ⚠️ SÉCURITÉ DEV : Si req.user n'existe pas (pas d'auth), on utilise l'ID 2
  const userId = req.user ? req.user.id : 2; 

  try {
    // 1. On cherche si le favori existe déjà
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_tripId: {
          userId,
          tripId,
        },
      },
    });

    if (existingFavorite) {
      // 2. S'il existe -> On le supprime (Dislike)
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
      return res.status(200).json({ message: 'Favori retiré', isFavorite: false });
    } else {
      // 3. S'il n'existe pas -> On le crée (Like)
      const favorite = await prisma.favorite.create({
        data: {
          userId,
          tripId,
        },
      });
      return res.status(201).json({ message: 'Favori ajouté', isFavorite: true, favorite });
    }

  } catch (error) {
    console.error("Erreur Toggle Favorite:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer les favoris de l'utilisateur connecté
// @route   GET /api/favorites
// @access  Private
const getMyFavorites = async (req, res) => {
  // On récupère les favoris de "moi" (l'utilisateur connecté ou l'ID 2)
  const userId = req.user ? req.user.id : 2;

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        trip: {
          include: {
            author: true, // On inclut l'auteur pour afficher son avatar si besoin
          },
        },
      },
      orderBy: {
        likedAt: 'desc' // Les plus récents en premier
      }
    });

    // On transforme la liste pour renvoyer directement les objets "Trip"
    const favoriteTrips = favorites.map(fav => {
        // On peut ajouter la date de like dans l'objet trip si besoin
        return { ...fav.trip, likedAt: fav.likedAt };
    });
    
    res.json(favoriteTrips);
  } catch (error) {
    console.error("Erreur Get Favorites:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vérifier si un voyage est en favori
// @route   GET /api/favorites/:tripId/check
// @access  Private
const checkFavoriteStatus = async (req, res) => {
  try {
    const tripId = parseInt(req.params.tripId);
    const userId = req.user.id; // On récupère l'ID via le token

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_tripId: {
          userId,
          tripId,
        },
      },
    });

    // On renvoie juste un booléen : true si trouvé, false sinon
    res.status(200).json({ isFavorite: !!favorite });

  } catch (error) {
    console.error("Erreur check favorite:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  toggleFavorite,
  getMyFavorites,
  checkFavoriteStatus,
};