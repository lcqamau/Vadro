import React, { useEffect, useState, useMemo, useCallback} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, StatusBar, ActivityIndicator, Keyboard, RefreshControl, Dimensions } from 'react-native';
import { Image } from 'expo-image'; 
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Assure-toi d'avoir installé expo-linear-gradient

import client from '../api/client';
import TripCard from '../components/TripCard';

const { width } = Dimensions.get('window');
const TAGS = ["Tout", "Plage", "Montagne", "Ville", "Europe", "Asie", "Pas cher", "Luxe", "Aventure"];

const HomeScreen = () => {
  const navigation = useNavigation();
  
  // --- DONNÉES ---
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // État pour le pull-to-refresh
  
  // --- RECHERCHE & FILTRES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState("Tout");
  const [showFilters, setShowFilters] = useState(false);
  

  // --- CHARGEMENT DES VOYAGES ---
  const fetchTrips = async () => {
    try {
      const response = await client.get('/trips');
      // On mélange un peu pour la démo, ou on trie par date
      setTrips(response.data.sort(() => 0.5 - Math.random()));
    } catch (error) {
      console.error("Erreur fetch trips:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, []));

  // Fonction appelée quand on tire vers le bas
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, []);

  // --- FILTRAGE INTELLIGENT ---
  const displayData = useMemo(() => {
      let filtered = trips;

      // 1. Tag
      if (selectedTag && selectedTag !== "Tout") {
        const tagRecherche = selectedTag.toLowerCase();
        filtered = filtered.filter(trip => 
          trip.tags && Array.isArray(trip.tags) && 
          trip.tags.some(t => t.toLowerCase() === tagRecherche)
        );
      }

      // 2. Recherche Texte
      if (searchQuery.length > 0) {
        const normalize = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
        const query = normalize(searchQuery);

        filtered = filtered.filter(trip => {
          const titleMatch = normalize(trip.title).includes(query);
          const descMatch = trip.description ? normalize(trip.description).includes(query) : false;
          const tagMatch = trip.tags ? trip.tags.some(tag => normalize(tag).includes(query)) : false;
          return titleMatch || descMatch || tagMatch;
        });
      }

      return filtered;
  }, [trips, searchQuery, selectedTag]);

  // --- COMPOSANT : HEADER DE LA LISTE (Featured Section) ---
  const ListHeader = () => {
    // On prend les 3 premiers comme "Featured" pour l'exemple
    const featuredTrips = trips.slice(0, 3); 

    return (
      <View>
        {/* Espace pour ne pas être caché par le Header Flottant */}
        <View style={{ height: showFilters ? 230 : 180 }} />

        {/* SECTION À LA UNE (Visible seulement si pas de recherche active) */}
        {searchQuery === '' && selectedTag === 'Tout' && featuredTrips.length > 0 && (
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>🔥 Tendances du moment</Text>
            <FlatList
              horizontal
              data={featuredTrips}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `featured-${item.id}`}
              contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.featuredCard}
                  onPress={() => navigation.navigate('TripDetails', { trip: item })}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.featuredOverlay} />
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredTag}>{item.tags?.[0]?.toUpperCase()}</Text>
                    <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginLeft: 20, marginTop: 10 }]}>
          {searchQuery || selectedTag !== 'Tout' ? 'Résultats' : 'Explorer le monde 🌍'}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (displayData.length === 0) return null;
    return (
      <View style={styles.footer}>
        <Ionicons name="checkmark-circle-outline" size={24} color="#00D668" />
        <Text style={styles.footerText}>Vous avez tout vu !</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D668" />
        <Text style={{ marginTop: 10, color: '#8E8E93' }}>Chargement de l'aventure...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* --- HEADER FLOTTANT (Fixe en haut) --- */}
      <View style={styles.floatingHeader}>
        
        {/* Ligne 1 : Salutation & Avatar */}
        <View style={styles.topRow}>
          <View>
             <Text style={styles.greeting}>VADRO</Text>
             <Text style={styles.subtitle}>Prêt pour votre prochaine évasion ?</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
            style={styles.avatarContainer}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' }} 
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </View>

        {/* Ligne 2 : Recherche & Filtre Toggle */}
        <View style={styles.searchRow}>
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color="#1A1A1A" style={{ marginRight: 10 }} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Où souhaitez-vous aller ?"
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); Keyboard.dismiss(); }}>
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.filterButton, showFilters && styles.filterButtonActive]} 
            onPress={() => setShowFilters(!showFilters)}
          >
             <Ionicons name="options-outline" size={22} color={showFilters ? "#fff" : "#1A1A1A"} />
          </TouchableOpacity>
        </View>

        {/* Ligne 3 : Tags (Conditionnel) */}
        {showFilters && (
          <View style={styles.tagsContainer}>
            <FlatList 
              horizontal
              data={TAGS}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.tagChip, selectedTag === item && styles.tagChipActive]}
                  onPress={() => setSelectedTag(item)}
                >
                  <Text style={[styles.tagText, selectedTag === item && styles.tagTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* --- LISTE PRINCIPALE --- */}
      <View style={styles.content}>
        <FlatList
          data={displayData}
          keyExtractor={(item) => item.id.toString()}
          
          // On utilise notre nouveau Header riche
          ListHeaderComponent={ListHeader}
          ListFooterComponent={renderFooter}
          
          // PULL TO REFRESH
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D668" />
          }
          
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <TripCard trip={item} />
            </View>
          )}
          
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          
          // Empty State amélioré
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="airplane-outline" size={60} color="#E5E5EA" />
              <Text style={styles.emptyTitle}>Aucun voyage trouvé</Text>
              <Text style={styles.emptyText}>Essayez de modifier vos filtres.</Text>
              <TouchableOpacity onPress={() => { setSelectedTag("Tout"); setSearchQuery(""); }} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Tout afficher</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },

  // --- HEADER FLOTTANT ---
  floatingHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: 'rgba(250,250,250,0.96)', // Effet semi-transparent
    paddingTop: 55, paddingBottom: 15, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  
  // Identité
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  greeting: { fontSize: 24, fontWeight: '900', color: '#1A1A1A', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#8E8E93', fontWeight: '500', marginTop: 2 },
  
  avatarContainer: { shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 5, elevation: 5 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#fff' },

  // Recherche
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchBarContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 15, paddingVertical: 12,
    borderWidth: 1, borderColor: '#F2F2F7',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1A1A1A', fontWeight: '500' },
  
  filterButton: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    marginLeft: 12, borderWidth: 1, borderColor: '#F2F2F7',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  filterButtonActive: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },

  // Tags
  tagsContainer: { marginTop: 15 },
  tagChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, backgroundColor: '#F2F2F7', marginRight: 8 },
  tagChipActive: { backgroundColor: '#1A1A1A' },
  tagText: { color: '#666', fontWeight: '600', fontSize: 13 },
  tagTextActive: { color: '#fff' },

  // --- SECTION "À LA UNE" ---
  featuredSection: { marginBottom: 25, marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 15, marginLeft: 20 },
  featuredCard: {
    width: 200, height: 250, borderRadius: 20, marginRight: 15,
    overflow: 'hidden', backgroundColor: '#F0F0F0',
  },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  featuredContent: { position: 'absolute', bottom: 15, left: 15, right: 15 },
  featuredTag: { color: '#00D668', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  featuredTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', lineHeight: 22 },

  // --- LISTE ---
  content: { flex: 1 },
  cardWrapper: { paddingHorizontal: 20, marginBottom: 5 }, // Marge gérée par la TripCard maintenant
  footer: { alignItems: 'center', marginTop: 10, marginBottom: 20, opacity: 0.5 },
  footerText: { color: '#8E8E93', marginTop: 5, fontWeight: '500' },

  // Empty
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginTop: 20, marginBottom: 10 },
  emptyText: { color: '#8E8E93', fontSize: 15, textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  resetButton: { paddingHorizontal: 25, paddingVertical: 14, backgroundColor: '#1A1A1A', borderRadius: 25 },
  resetButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});

export default HomeScreen;