import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Charger les favoris au démarrage
  const fetchFavorites = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        setLoading(false);
        return; 
      }
      
      // On suppose une route qui renvoie les IDs des favoris de l'user
      // Si elle n'existe pas, on peut faire /favorites et mapper les IDs
      const res = await client.get('/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Supposons que res.data est un tableau d'objets ou d'IDs
      // Si c'est tableau de trips: res.data.map(t => t.id)
      // Si c'est tableau de favoris (relation): res.data.map(f => f.tripId)
      
      // Adapte selon ton retour API actuel. 
      // D'après tes controllers précédents, getFavorites renvoie surement les trips ou les relations.
      // On va supposer un tableau d'objets qui ont un champ 'id' (si c'est des trips) ou 'tripId'
      
      const ids = new Set(res.data.map(item => item.tripId || item.id));
      setFavoriteIds(ids);
      
    } catch (error) {
      console.log("Erreur chargement favoris (peut-être pas connecté)", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Ajouter / Enlever un favori
  const toggleFavorite = async (tripId) => {
    // 1. Vibration
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}

    // 2. UI Optimiste
    const isLiked = favoriteIds.has(tripId);
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (isLiked) next.delete(tripId);
      else next.add(tripId);
      return next;
    });

    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        // Rollback si pas connecté
        Alert.alert("Connectez-vous", "Vous devez être connecté pour ajouter des favoris.");
        setFavoriteIds(prev => {
            const next = new Set(prev);
            if (isLiked) next.add(tripId); // On remet comme c'était
            else next.delete(tripId);
            return next;
        });
        return;
      }

      // 3. Appel API
      // POST /favorites/:id bascule le favori coté serveur
      await client.post(`/favorites/${tripId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Si ton API ne fait pas de bascule auto mais a DELETE/POST séparés, adapte ici.
      // D'après ton TripCard original, c'était un POST toggle.

    } catch (error) {
      console.error("Erreur sync favori:", error);
      // Rollback
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (isLiked) next.add(tripId);
        else next.delete(tripId);
        return next;
      });
    }
  };

  // Forcer l'ajout (pour le swipe right)
  const likeFavorite = async (tripId) => {
    if (favoriteIds.has(tripId)) return; // Déjà liké
    toggleFavorite(tripId);
  };

  // Forcer le retrait (pour le swipe left)
  const dislikeFavorite = async (tripId) => {
    if (!favoriteIds.has(tripId)) return; // Déjà pas liké
    toggleFavorite(tripId);
  };

  const isFavorite = (tripId) => favoriteIds.has(tripId);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, likeFavorite, dislikeFavorite, isFavorite, refreshFavorites: fetchFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
