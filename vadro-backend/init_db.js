const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const main = async () => {
  try {
    console.log("🔄 Nettoyage de la base de données...");
    // Suppression dans l'ordre inverse pour respecter les clés étrangères
    await prisma.review.deleteMany({});
    await prisma.favorite.deleteMany({});
    await prisma.step.deleteMany({});
    await prisma.trip.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("👤 Création des Éclaireurs...");
    
    // 1. Création de l'Utilisateur Principal (Admin)
    const admin = await prisma.user.create({
      data: {
        username: 'Vadro Official',
        email: 'team@vadro.app',
        avatarUrl: 'https://i.pravatar.cc/150?u=vadro',
        trustScore: 100,
        bio: "Le compte officiel de l'équipe Vadro."
      }
    });

    // 2. Création d'un utilisateur "Expert"
    const userJulien = await prisma.user.create({
      data: {
        username: 'Julien V.',
        email: 'julien@test.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=julien',
        trustScore: 98,
        bio: "Vanlifer passionné par la Corse."
      }
    });

    console.log("🗺️ Création des Voyages...");

    // VOYAGE 1 : La Corse (Complet avec étapes GPS précises)
    await prisma.trip.create({
      data: {
        title: 'La Corse Sauvage',
        description: "Un road trip inoubliable du Cap Corse aux plages du désert des Agriates. Idéal en van ou en moto.",
        distanceKm: 620,
        durationDays: 4,
        budgetEuro: 450,
        imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
        tags: ["Vanlife", "Nature", "Mer"],
        authorId: userJulien.id, // CORRECTION: authorId au lieu de userId
        steps: {
          create: [
            { 
              orderIndex: 1, 
              name: "Départ Bastia", 
              type: "start", 
              latitude: 42.70278, 
              longitude: 9.45000, 
              description: "Arrivée du Ferry. Direction le Cap Corse." 
            },
            { 
              orderIndex: 2, 
              name: "Plage de Nonza", 
              type: "spot", 
              latitude: 42.78500, 
              longitude: 9.34400, 
              description: "Plage de galets noirs unique. Le village est perché juste au-dessus.",
              imageUrl: "https://images.unsplash.com/photo-1533294371584-c8da7256a57e"
            },
            { 
              orderIndex: 3, 
              name: "Désert des Agriates", 
              type: "sleep", 
              latitude: 42.66000, 
              longitude: 9.20000, 
              description: "Spot bivouac autorisé à l'entrée du désert." 
            },
            { 
              orderIndex: 4, 
              name: "Calvi", 
              type: "end", 
              latitude: 42.56860, 
              longitude: 8.75690, 
              description: "Fin du trip à la citadelle." 
            }
          ]
        }
      }
    });

    // VOYAGE 2 : Week-end Amsterdam (Pour tester le filtre 48h)
    await prisma.trip.create({
      data: {
        title: 'Amsterdam Express',
        description: "48h pour découvrir les canaux et la route des moulins depuis le Nord de la France.",
        distanceKm: 250,
        durationDays: 2,
        budgetEuro: 300,
        imageUrl: 'https://images.unsplash.com/photo-1512470876302-ac687c9e2543',
        tags: ["48h Chrono", "Urbain", "Culture"],
        authorId: admin.id, // CORRECTION: authorId au lieu de userId
        steps: {
          create: [
            { orderIndex: 1, name: "Lille (Départ)", type: "start", latitude: 50.62925, longitude: 3.05725 },
            { orderIndex: 2, name: "Anvers", type: "spot", latitude: 51.21944, longitude: 4.40246 },
            { orderIndex: 3, name: "Amsterdam Centre", type: "sleep", latitude: 52.36757, longitude: 4.90413 }
          ]
        }
      }
    });

    // VOYAGE 3 : Dolomites (Pour le Swipe)
    await prisma.trip.create({
      data: {
        title: 'Dolomites : Lago di Braies',
        description: "Les plus beaux lacs d'Europe en une semaine. Attention ça grimpe !",
        distanceKm: 850,
        durationDays: 7,
        budgetEuro: 650,
        imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
        tags: ["Montagne", "Rando", "Photo"],
        authorId: admin.id, // CORRECTION: authorId au lieu de userId
        steps: {
          create: [
            { orderIndex: 1, name: "Bolzano", type: "start", latitude: 46.49829, longitude: 11.35475 },
            { orderIndex: 2, name: "Lago di Braies", type: "spot", latitude: 46.69473, longitude: 12.08540 }
          ]
        }
      }
    });

    console.log("✅ Base de données VADRO initialisée avec succès !");

  } catch (e) {
    console.error("❌ Erreur lors du seeding :", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();