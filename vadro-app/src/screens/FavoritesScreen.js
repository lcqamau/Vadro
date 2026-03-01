import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image'; // Utilisation d'Expo Image pour la perf
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import apiClient from '../api/client'; // Ton client Axios
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2;

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour charger les favoris
  const fetchFavorites = async () => {
    const token = await SecureStore.getItemAsync('userToken');

    if (!token) {
      navigation.replace('Login');
      return;
    }
    try {
      const response = await apiClient.get('/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data);
    } catch (error) {
      console.error("Erreur chargement favoris:", error);
    } finally {
      setLoading(false);
    }
  };

  // useFocusEffect permet de recharger la liste à chaque fois qu'on revient sur l'écran
  // (Utile si tu as retiré un favori depuis la Home ou Details)
  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  // Fonction pour supprimer un favori (Appel API)
  const removeFavorite = async (tripId) => {
    // 1. Mise à jour Optimiste (On supprime visuellement tout de suite)
    const oldList = wishlist;
    setWishlist(current => current.filter(item => item.id !== tripId));

    try {
      // 2. Appel API réel
      await client.post(`/favorites/${tripId}`);
    } catch (error) {
      // Si erreur, on remet la liste comme avant
      console.error("Erreur suppression:", error);
      alert("Impossible de supprimer ce favori.");
      setWishlist(oldList);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9}
      onPress={() => navigation.navigate('TripDetails', { trip: item })}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.cardImage} 
        contentFit="cover"
        transition={200}
      />
      
      {/* Bouton Supprimer */}
      <TouchableOpacity style={styles.deleteButton} onPress={() => removeFavorite(item.id)}>
        <BlurView intensity={30} tint="dark" style={styles.blurCircle}>
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </BlurView>
      </TouchableOpacity>

      {/* Infos */}
      <LinearGradient 
        colors={['transparent', 'rgba(0,0,0,0.8)']} 
        style={styles.gradientOverlay} 
      />
      
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardDays}>{item.durationDays} jours</Text>
          <View style={styles.priceTag}>
             <Text style={styles.priceText}>{item.budgetEuro}€</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00D668" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Ma Wishlist</Text>
            <Text style={styles.subtitle}>
              {wishlist.length} voyage{wishlist.length > 1 ? 's' : ''} de rêve
            </Text>
          </View>
        </View>

        {/* LISTE */}
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="heart-outline" size={50} color="#ccc" />
              </View>
              <Text style={styles.emptyText}>Votre wishlist est vide.</Text>
              <Text style={styles.emptySubText}>Explorez le monde pour ajouter des voyages ici !</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Explore')} style={styles.exploreBtn}>
                <Text style={styles.exploreBtnText}>Explorer maintenant</Text>
              </TouchableOpacity>
            </View>
          }
        />

      </SafeAreaView>
    </View>
  );
};

// ... J'ai ajouté LinearGradient, n'oublie pas l'import :
import { LinearGradient } from 'expo-linear-gradient';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: 20, paddingVertical: 15, marginBottom: 5 },
  title: { fontSize: 32, fontWeight: '900', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#8E8E93', fontWeight: '600' },

  listContainer: { paddingHorizontal: 15, paddingBottom: 100 },
  
  card: {
    width: CARD_WIDTH, height: 240, margin: 7, borderRadius: 24,
    backgroundColor: '#fff', shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
    overflow: 'hidden', position: 'relative'
  },
  cardImage: { width: '100%', height: '100%' },
  gradientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },

  deleteButton: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
  blurCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
  },

  cardInfo: { position: 'absolute', bottom: 15, left: 15, right: 15 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 6, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDays: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  priceTag: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  priceText: { color: '#000', fontWeight: '900', fontSize: 12 },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 5 },
  emptySubText: { fontSize: 14, color: '#8E8E93', textAlign: 'center', paddingHorizontal: 40, marginBottom: 30 },
  exploreBtn: { backgroundColor: '#1A1A1A', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 30 },
  exploreBtnText: { color: '#fff', fontWeight: 'bold' }
});

export default FavoritesScreen;