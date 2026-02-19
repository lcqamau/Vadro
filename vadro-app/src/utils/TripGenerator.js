import { DESTINATIONS_DB } from './DestinationsData';

const GENERIC_ACTIVITIES = [
  { title: "Exploration du centre-ville 🏙️", desc: "Balade à pied pour découvrir l'architecture et l'ambiance locale.", type: 'morning' },
  { title: "Déjeuner local 🍽️", desc: "Dégustation des spécialités culinaires de la région.", type: 'afternoon' },
  { title: "Visite de musée 🏛️", desc: "Découverte de l'histoire et de la culture locale.", type: 'afternoon' },
  { title: "Détente au parc 🌳", desc: "Promenade relaxante dans les espaces verts.", type: 'afternoon' },
  { title: "Soirée animée 🍸", desc: "Découverte de la vie nocturne et des bars locaux.", type: 'evening' },
  { title: "Coucher de soleil 🌅", desc: "Admirer la vue panoramique au crépuscule.", type: 'evening' },
  { title: "Marché local 🍎", desc: "Flânerie dans le marché pour sentir les produits frais.", type: 'morning' },
  { title: "Shopping souvenirs 🛍️", desc: "Petite session shopping dans les boutiques artisanales.", type: 'afternoon' }
];

// FONCTION PRINCIPALE : GÉNÉRER UN VOYAGE COMPLET
export const generateTrip = (vibes, days, travelers, budgetLevel) => {
  // 1. FILTRAGE INTELLIGENT
  // On cherche les destinations qui correspondent à AU MOINS UNE des vibes choisies
  const userVibes = (vibes && vibes.length > 0) ? vibes : ['chill'];
  
  let matchingDestinations = DESTINATIONS_DB.filter(dest => 
    dest.tags.some(tag => userVibes.includes(tag))
  );

  // Fallback : Si rien ne matche, on prend toute la base
  if (matchingDestinations.length === 0) matchingDestinations = DESTINATIONS_DB;

  // Sélection aléatoire d'une ville
  const selectedDest = matchingDestinations[Math.floor(Math.random() * matchingDestinations.length)];

  // 2. CALCUL DU BUDGET
  let multiplier = 1;
  const budgetId = budgetLevel?.id || 'standard';
  if (budgetId === 'eco') multiplier = 0.7;
  if (budgetId === 'luxe') multiplier = 2.5;
  
  const totalPrice = Math.round(selectedDest.basePrice * days * travelers * multiplier);

  // 3. GÉNÉRATION PLANNING (LOGIQUE MATIN/APRÈM/SOIR)
  const itinerary = [];
  
  // On sépare les activités par type pour mieux les répartir
  const morningActs = selectedDest.activities.filter(a => a.type === 'morning');
  const afternoonActs = selectedDest.activities.filter(a => a.type === 'afternoon');
  const eveningActs = selectedDest.activities.filter(a => a.type === 'evening');
  
  // Petite fonction utilitaire pour piocher au hasard
  const pickRandom = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : { title: "Temps libre", desc: "Exploration libre de la ville." };

  for (let i = 1; i <= days; i++) {
    // Logique de rotation :
    // Jour 1 : Matin
    // Jour 2 : Aprèm
    // Jour 3 : Soir
    // Jour 4 : Matin...
    // (C'est une logique simple pour varier les plaisirs)
    
    let activity;
    const cycle = i % 3; 

    if (cycle === 1) activity = pickRandom(morningActs);
    else if (cycle === 2) activity = pickRandom(afternoonActs);
    else activity = pickRandom(eveningActs);

    itinerary.push({
      day: i,
      title: `Jour ${i}`,
      activityTitle: activity.title,
      activityDesc: activity.desc
    });
  }

  return {
    destination: selectedDest.name,
    image: selectedDest.image,
    priceEstimate: `${totalPrice}€`,
    destinationId: selectedDest.id,
    location: selectedDest.location, // On passe la loc pour la map
    days: itinerary
  };
};

// FONCTION SECONDAIRE : SWAP
export const getAlternativeActivity = (destinationName, currentActivityTitle) => {
  const dest = DESTINATIONS_DB.find(d => d.name === destinationName);
  
  if (dest) {
      const otherActivities = dest.activities.filter(a => a.title !== currentActivityTitle);
      if (otherActivities.length > 0) {
        return otherActivities[Math.floor(Math.random() * otherActivities.length)].title;
      }
  }

  // Fallback générique
  const randomGeneric = GENERIC_ACTIVITIES[Math.floor(Math.random() * GENERIC_ACTIVITIES.length)];
  if (randomGeneric.title === currentActivityTitle) return "Balade improvisée";
  return randomGeneric.title;
};

// NOUVELLE FONCTION POUR REMPLIR UN JOUR
export const generateDayPlan = (destinationName) => {
  const dest = DESTINATIONS_DB.find(d => d.name === destinationName);
  
  const activities = [];
  
  // Helper
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const fallback = (arr) => arr.length > 0 ? pick(arr) : pick(GENERIC_ACTIVITIES);

  if (dest) {
     const morning = dest.activities.filter(a => a.type === 'morning');
     const afternoon = dest.activities.filter(a => a.type === 'afternoon');
     const evening = dest.activities.filter(a => a.type === 'evening');
     
     activities.push(fallback(morning));
     activities.push(fallback(afternoon));
     activities.push(fallback(evening));
  } else {
      const morning = GENERIC_ACTIVITIES.filter(a => a.type === 'morning');
      const afternoon = GENERIC_ACTIVITIES.filter(a => a.type === 'afternoon');
      const evening = GENERIC_ACTIVITIES.filter(a => a.type === 'evening');
      
      activities.push(pick(morning));
      activities.push(pick(afternoon));
      activities.push(pick(evening));
  }
  
  // Formatage pour l'app
  return activities.map(a => ({
      title: a.title,
      desc: a.desc,
      image: a.image || `https://source.unsplash.com/random/200x100?${a.title.split(' ')[0]}`
  }));
};