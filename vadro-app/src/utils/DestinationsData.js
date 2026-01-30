// src/data/DestinationsData.js

export const DESTINATIONS_DB = [
  // --- ASIE ---
  {
    id: 'bali_ind',
    name: 'Bali, Indonésie',
    location: { lat: -8.4095, lng: 115.1889 }, // Utile pour la map plus tard
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    tags: ['nature', 'chill', 'culture', 'adventure'],
    basePrice: 60,
    activities: [
      { title: "Yoga à Ubud", type: "morning", desc: "Session spirituelle au lever du soleil dans la jungle.", tags: ["chill"] },
      { title: "Forêt des Singes", type: "morning", desc: "Balade au milieu des macaques sacrés.", tags: ["nature"] },
      { title: "Surf à Uluwatu", type: "afternoon", desc: "Les meilleures vagues de l'île.", tags: ["sport"] },
      { title: "Rizières de Tegallalang", type: "afternoon", desc: "Randonnée dans les terrasses classées UNESCO.", tags: ["nature"] },
      { title: "Sunset à Tanah Lot", type: "evening", desc: "Vue iconique sur le temple marin.", tags: ["culture"] },
      { title: "Beach Club à Canggu", type: "evening", desc: "Cocktails et musique face à l'océan.", tags: ["party"] }
    ]
  },
  
  // --- EUROPE ---
  {
    id: 'paris_fr',
    name: 'Paris, France',
    location: { lat: 48.8566, lng: 2.3522 },
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    tags: ['culture', 'food', 'luxe', 'romantic'],
    basePrice: 140,
    activities: [
      { title: "Croissant & Café de Flore", type: "morning", desc: "Le petit-déjeuner parisien typique.", tags: ["food"] },
      { title: "Musée du Louvre", type: "morning", desc: "Rencontre avec la Joconde.", tags: ["culture"] },
      { title: "Shopping Champs-Élysées", type: "afternoon", desc: "Les plus belles boutiques du monde.", tags: ["luxe"] },
      { title: "Montmartre & Sacré-Cœur", type: "afternoon", desc: "Balade dans le quartier des artistes.", tags: ["romantic"] },
      { title: "Dîner croisière Seine", type: "evening", desc: "Paris by night depuis le fleuve.", tags: ["romantic"] },
      { title: "Cabaret Moulin Rouge", type: "evening", desc: "Le spectacle mythique de French Cancan.", tags: ["culture"] }
    ]
  },

  // --- AMÉRIQUE ---
  {
    id: 'tulum_mex',
    name: 'Tulum, Mexique',
    location: { lat: 20.2114, lng: -87.4654 },
    image: 'https://images.unsplash.com/photo-1506158669146-619067262a00',
    tags: ['party', 'nature', 'chill', 'luxe'],
    basePrice: 110,
    activities: [
      { title: "Ruines Mayas", type: "morning", desc: "Histoire ancienne face à la mer turquoise.", tags: ["culture"] },
      { title: "Plongée Cenote Dos Ojos", type: "morning", desc: "Exploration des grottes sous-marines.", tags: ["adventure"] },
      { title: "Chill au Papaya Playa", type: "afternoon", desc: "Détente bohème sur la plage.", tags: ["chill"] },
      { title: "Vélo dans la Jungle", type: "afternoon", desc: "Balade écolo vers la réserve de Sian Ka'an.", tags: ["nature"] },
      { title: "Dîner Jungle à Hartwood", type: "evening", desc: "Cuisine locale haut de gamme à la bougie.", tags: ["food"] },
      { title: "Full Moon Party", type: "evening", desc: "Danse sur la plage jusqu'au bout de la nuit.", tags: ["party"] }
    ]
  },
  
  // --- AFRIQUE ---
  {
    id: 'marrakech_mar',
    name: 'Marrakech, Maroc',
    location: { lat: 31.6295, lng: -7.9811 },
    image: 'https://images.unsplash.com/photo-1531862112447-074472c57f29',
    tags: ['culture', 'food', 'chill', 'budget'],
    basePrice: 50,
    activities: [
      { title: "Jardin Majorelle", type: "morning", desc: "Les couleurs d'Yves Saint Laurent.", tags: ["culture"] },
      { title: "Palais de la Bahia", type: "morning", desc: "Architecture marocaine époustouflante.", tags: ["culture"] },
      { title: "Souks de la Médina", type: "afternoon", desc: "Négociation et artisanat local.", tags: ["adventure"] },
      { title: "Hammam Traditionnel", type: "afternoon", desc: "Gommage et détente absolue.", tags: ["chill"] },
      { title: "Place Jemaa el-Fna", type: "evening", desc: "Charmeurs de serpents et street food.", tags: ["food"] },
      { title: "Dîner sur un Riad", type: "evening", desc: "Couscous royal sous les étoiles.", tags: ["food"] }
    ]
  }
];