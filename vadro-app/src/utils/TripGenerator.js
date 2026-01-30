// src/utils/TripGenerator.js
import { DESTINATIONS_DB } from './DestinationsData';

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
  if (!dest) return "Balade improvisée";

  // On prend toutes les activités sauf l'actuelle
  const otherActivities = dest.activities.filter(a => a.title !== currentActivityTitle);

  if (otherActivities.length > 0) {
    return otherActivities[Math.floor(Math.random() * otherActivities.length)].title;
  }
  
  return "Détente à l'hôtel";
};