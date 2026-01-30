// src/utils/TripGenerator.js

// 1. BASE DE DONNÉES RICHE (Mock Data)
const DESTINATIONS_DB = [
  {
    id: 'bali',
    name: 'Bali, Indonésie',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    tags: ['nature', 'chill', 'culture'],
    basePrice: 60, // Prix par jour par personne
    activities: [
      "Yoga au lever du soleil à Ubud", 
      "Surf sur la plage d'Uluwatu", 
      "Visite du temple Tanah Lot", 
      "Randonnée dans les rizières de Tegallalang",
      "Dégustation de café Luwak", 
      "Massage balinais traditionnel",
      "Snorkeling avec les tortues à Gili",
      "Dîner de fruits de mer à Jimbaran",
      "Spectacle de danse Kecak"
    ]
  },
  {
    id: 'nyc',
    name: 'New York, USA',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4a0e2907eb',
    tags: ['party', 'culture', 'food', 'luxe'],
    basePrice: 150,
    activities: [
      "Balade à vélo dans Central Park", 
      "Vue du sommet de l'Empire State Building",
      "Spectacle sur Broadway", 
      "Pizza tour à Brooklyn",
      "Visite du MoMA", 
      "Shopping sur la 5ème Avenue",
      "Traversée du pont de Brooklyn au coucher du soleil",
      "Cocktail sur un rooftop à Manhattan",
      "Ferry vers la Statue de la Liberté"
    ]
  },
  {
    id: 'tokyo',
    name: 'Tokyo, Japon',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
    tags: ['culture', 'food', 'adventure'],
    basePrice: 120,
    activities: [
      "Traversée du carrefour de Shibuya", 
      "Visite du temple Senso-ji",
      "Dégustation de sushis au marché aux poissons", 
      "Shopping geek à Akihabara",
      "Soirée Karaoké dans une tour", 
      "Détente dans un Onsen",
      "Visite du musée TeamLab Borderless",
      "Balade dans le parc Yoyogi",
      "Dîner dans une ruelle de Shinjuku"
    ]
  },
  {
    id: 'costarica',
    name: 'Costa Rica',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801',
    tags: ['nature', 'adventure', 'chill'],
    basePrice: 80,
    activities: [
      "Tyrolienne au dessus de la canopée", 
      "Observation des paresseux",
      "Surf à Santa Teresa", 
      "Randonnée au volcan Arenal",
      "Baignade dans les sources chaudes", 
      "Exploration de la jungle nocturne",
      "Kayak dans la mangrove",
      "Détente sur la plage de Manuel Antonio"
    ]
  },
  {
    id: 'ibiza',
    name: 'Ibiza, Espagne',
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67',
    tags: ['party', 'chill', 'food', 'luxe'],
    basePrice: 100,
    activities: [
      "Fête sur un catamaran", 
      "Coucher de soleil au Café del Mar",
      "Soirée clubbing au Pacha", 
      "Détente sur la plage de Ses Illetes",
      "Exploration de la vieille ville Dalt Vila",
      "Marché hippie de Las Dalias",
      "Snorkeling dans les criques cachées"
    ]
  },
  {
    id: 'rome',
    name: 'Rome, Italie',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9',
    tags: ['culture', 'food', 'history'],
    basePrice: 90,
    activities: [
      "Visite du Colisée", 
      "Dégustation de Gelato à la fontaine de Trevi",
      "Exploration du Vatican", 
      "Dîner pâtes fraîches à Trastevere",
      "Balade dans les jardins de la Villa Borghese",
      "Visite du Panthéon",
      "Aperitivo sur une place historique"
    ]
  }
];

// 2. FONCTION PRINCIPALE : GÉNÉRER UN VOYAGE COMPLET
export const generateTrip = (vibes, days, travelers, budgetLevel) => {
  // A. Trouver la meilleure destination selon les vibes
  // On cherche une destination qui a au moins une des vibes sélectionnées
  // Si vibes est vide, on met 'chill' par défaut
  const userVibes = (vibes && vibes.length > 0) ? vibes : ['chill'];
  
  let matchingDestinations = DESTINATIONS_DB.filter(dest => 
    dest.tags.some(tag => userVibes.includes(tag))
  );

  // Si rien ne matche, on prend tout (fallback)
  if (matchingDestinations.length === 0) matchingDestinations = DESTINATIONS_DB;

  // On en choisit une au hasard parmi celles qui matchent
  const selectedDest = matchingDestinations[Math.floor(Math.random() * matchingDestinations.length)];

  // B. Calculer le prix
  let multiplier = 1;
  // budgetLevel est un objet { id: 'eco', ... } ou juste une string selon comment tu l'as passé
  const budgetId = budgetLevel.id || budgetLevel; 
  
  if (budgetId === 'eco') multiplier = 0.7;
  if (budgetId === 'luxe') multiplier = 2.0;
  
  const totalPrice = Math.round(selectedDest.basePrice * days * travelers * multiplier);

  // C. Générer l'itinéraire jour par jour
  const itinerary = [];
  const usedActivities = new Set(); // Pour éviter les doublons au départ

  for (let i = 1; i <= days; i++) {
    // Choisir une activité qu'on n'a pas encore faite
    let activity = "Exploration libre";
    const availableActivities = selectedDest.activities.filter(a => !usedActivities.has(a));
    
    if (availableActivities.length > 0) {
      // On prend une activité au hasard
      activity = availableActivities[Math.floor(Math.random() * availableActivities.length)];
      usedActivities.add(activity);
    } else {
      // Si on a épuisé les activités, on remet des classiques ou on repioche
      activity = selectedDest.activities[Math.floor(Math.random() * selectedDest.activities.length)];
    }

    itinerary.push({
      day: i,
      title: `Jour ${i}`,
      activityTitle: activity,
      activityDesc: "Une expérience inoubliable sélectionnée pour vous."
    });
  }

  // D. Retourner l'objet complet
  return {
    destination: selectedDest.name,
    image: selectedDest.image,
    priceEstimate: `${totalPrice}€`,
    destinationId: selectedDest.id, // Utile pour retrouver la ville plus tard
    days: itinerary
  };
};

// 3. FONCTION SECONDAIRE : ÉCHANGER UNE ACTIVITÉ (SWAP)
export const getAlternativeActivity = (destinationName, currentActivity) => {
  // 1. On retrouve la destination dans la DB
  const dest = DESTINATIONS_DB.find(d => d.name === destinationName);
  
  if (!dest) return "Promenade libre";

  // 2. On filtre pour ne pas reprendre la même activité
  const otherActivities = dest.activities.filter(a => a !== currentActivity);

  // 3. On en prend une au hasard
  if (otherActivities.length > 0) {
    return otherActivities[Math.floor(Math.random() * otherActivities.length)];
  }
  
  return "Détente au café local";
};