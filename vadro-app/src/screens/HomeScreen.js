import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Dimensions, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SwipeDeck from '../components/SwipeDeck';
import client from '../api/client';
import TripCard from '../components/TripCard';
import { useNavigation } from '@react-navigation/native';
const { width } = Dimensions.get('window');

// 📏 CONFIGURATION PRÉCISE DES TAILLES
const CARD_WIDTH = width * 0.9; // La carte fait 90% de l'écran
const SIDE_MARGIN = (width - CARD_WIDTH) / 2; // Marge exacte pour centrer

const HomeScreen = () => {
  const navigation = useNavigation();
  const [selectedZone, setSelectedZone] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);

  const COLORS = {
    background: '#FAFAFA',
    green: '#00D668',
    textDark: '#1A1A1A',
    textGrey: '#8E8E93',
    inputBg: '#F2F2F7',
    red: '#FF3B30',
  };

  const fetchTrips = async () => {
    try {
      const response = await client.get('/trips');
      setTrips(response.data);
      setFilteredTrips(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const goToDetails = (trip, image) => {
    // On navigue vers l'écran 'TripDetails' en passant les infos
    navigation.navigate('TripDetails', { trip: { ...trip, image: image } });
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text) {
      const newData = trips.filter(item => 
        item.title?.toUpperCase().includes(text.toUpperCase())
      );
      setFilteredTrips(newData);
    } else {
      setFilteredTrips(trips);
    }
  };

  // --- RENDU FEED (SWIPE) ---
    const renderFeed = () => {
        if (trips.length === 0) return <Text style={styles.emptyText}>Plus de voyages !</Text>;

        return (
        <View style={styles.swiperContainer}>
            <SwipeDeck
            data={trips}
            renderCard={(item) => <TripCard trip={item} />}
            onSwipeRight={(item) => console.log('Like', item.title)}
            onSwipeLeft={(item) => console.log('Pass', item.title)}
            />
        </View>
        );
    };

  // --- RENDU RECHERCHE ---
  const renderSearch = () => (
    <View style={styles.searchContainer}>
      <View style={[styles.searchBar, { backgroundColor: COLORS.inputBg }]}>
        <Ionicons name="search" size={20} color={COLORS.textGrey} />
        <TextInput
          style={[styles.searchInput, { color: COLORS.textDark }]}
          placeholder="Où veux-tu partir ?"
          placeholderTextColor={COLORS.textGrey}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.searchResultItem} onPress={() => goToDetails(item, selectedZone?.image)}>
            <View>
              <Text style={styles.resultTitle}>{item.title}</Text>
              <Text style={styles.resultInfo}>{item.distanceKm} km • {item.durationDays} jours</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textGrey} />
          </TouchableOpacity>
        )}
      />
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color={COLORS.green} style={styles.center} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* 1. LE HEADER AVEC LE LOGO */}
      <View style={styles.topHeader}>
        <Text style={styles.logoText}>VADRO</Text>
        <TouchableOpacity style={styles.profileButton}>
            {/* Petit avatar ou icône profil */}
            <Ionicons name="person-circle-outline" size={34} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* 2. LES ONGLETS */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveTab('feed')} style={styles.tabButton}>
          <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>Inspiration</Text>
          {activeTab === 'feed' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity onPress={() => setActiveTab('search')} style={styles.tabButton}>
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Recherche</Text>
          {activeTab === 'search' && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>

      {/* 3. LE CONTENU */}
      <View style={styles.content}>
        {activeTab === 'feed' ? renderFeed() : renderSearch()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // NOUVEAU HEADER
  topHeader: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  logoText: {
    fontFamily: 'Roboto', // Ou ta police par défaut
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -1,
  },

  // TABS
  tabsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    paddingBottom: 10, 
    backgroundColor: '#FAFAFA',
    zIndex: 10 
  },
  tabButton: { paddingHorizontal: 25, alignItems: 'center' },
  tabText: { fontSize: 16, fontWeight: '600', color: '#C7C7CC' },
  activeTabText: { color: '#1A1A1A', fontWeight: 'bold' },
  activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#00D668', marginTop: 4 },
  divider: { width: 1, height: 15, backgroundColor: '#E5E5EA', marginHorizontal: 5, alignSelf: 'center' },

  content: { flex: 1 },
  // Container Swiper : margin negative pour remonter un peu si besoin
  swiperContainer: { flex: 1, marginTop: 20},
  emptyText: { textAlign: 'center', marginTop: 100, fontSize: 18, color: '#8E8E93' },

  // RECHERCHE
  searchContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: '500' },
  searchResultItem: {
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  resultTitle: { color: '#1A1A1A', fontWeight: 'bold', fontSize: 16 },
  resultInfo: { color: '#8E8E93', fontSize: 13, marginTop: 4 },
});

export default HomeScreen;