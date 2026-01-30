// src/screens/FavoritesScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2; // Calcul pour 2 colonnes avec marges

// --- DONNÉES DE TEST (Tes Favoris) ---
const FAVORITES = [
  { id: 1, title: 'Bali Vibes', price: '850€', days: 12, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4' },
  { id: 2, title: 'New York City', price: '1200€', days: 5, image: 'https://images.unsplash.com/photo-1496442226666-8d4a0e2907eb' },
  { id: 3, title: 'Safari Kenya', price: '2100€', days: 8, image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801' },
  { id: 4, title: 'Santorin', price: '600€', days: 4, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff' },
  { id: 5, title: 'Tulum Beach', price: '1400€', days: 10, image: 'https://images.unsplash.com/photo-1506158669146-619067262a00' },
  { id: 6, title: 'Tokyo Neon', price: '1800€', days: 14, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf' },
];

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [wishlist, setWishlist] = useState(FAVORITES);

  // Supprimer un favori
  const removeFavorite = (id) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('TripDetails', { trip: item })}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      
      {/* Bouton Supprimer (Petit cœur plein qui devient vide au clic si on voulait, ici on supprime) */}
      <TouchableOpacity style={styles.deleteButton} onPress={() => removeFavorite(item.id)}>
        <BlurView intensity={50} tint="dark" style={styles.blurCircle}>
          <Ionicons name="heart" size={16} color="#FF3B30" />
        </BlurView>
      </TouchableOpacity>

      {/* Infos du voyage */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardDays}>{item.days} jours</Text>
          <Text style={styles.cardPrice}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Ma Wishlist</Text>
            <Text style={styles.subtitle}>{wishlist.length} voyages sauvegardés</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="filter" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* LISTE GRILLE */}
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2} // Grille 2 colonnes
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 100 }} />} // Espace pour la navbar
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="heart-dislike-outline" size={40} color="#ccc" />
              </View>
              <Text style={styles.emptyText}>Ta wishlist est vide.</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                <Text style={styles.emptyLink}>Explorer les voyages</Text>
              </TouchableOpacity>
            </View>
          }
        />

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '900', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  filterBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },

  // Liste
  listContainer: { paddingHorizontal: 15, paddingTop: 10 },
  
  // Carte
  card: {
    width: CARD_WIDTH,
    height: 220,
    margin: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  // Bouton Delete
  deleteButton: { position: 'absolute', top: 10, right: 10 },
  blurCircle: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden'
  },

  // Info bas de carte
  cardInfo: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 12,
    // Dégradé simulé par background semi-transparent
    backgroundColor: 'rgba(0,0,0,0.4)', 
  },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDays: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '500' },
  cardPrice: { color: '#00D668', fontWeight: 'bold', fontSize: 14, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },

  // Empty State
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  emptyText: { fontSize: 18, color: '#8E8E93', fontWeight: '500' },
  emptyLink: { marginTop: 10, color: '#00D668', fontWeight: 'bold', fontSize: 16 },
});

export default FavoritesScreen;