import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, StatusBar, ActivityIndicator, Keyboard, RefreshControl, Dimensions, Alert, Animated } from 'react-native';
import { Image } from 'expo-image'; 
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; 
import Swiper from 'react-native-deck-swiper';
import { useFavorites } from '../context/FavoritesContext';

import client from '../api/client';
import TripCard from '../components/TripCard';

const { width, height } = Dimensions.get('window');
const TAGS = ["Tout", "Plage", "Montagne", "Ville", "Europe", "Asie", "Pas cher", "Luxe", "Aventure"];

const HomeScreen = () => {
  const navigation = useNavigation();
  // --- GESTION SWIPE ---
  const { toggleFavorite, likeFavorite, dislikeFavorite, favoriteIds } = useFavorites();
  
  // --- DONNÉES ---
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 
  
  // --- RECHERCHE & FILTRES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState("Tout");
  const [showFilters, setShowFilters] = useState(false);
  
  // --- MODE SWIPE ---
  const [isSwipeMode, setIsSwipeMode] = useState(false); 
  const swiperRef = useRef(null);
  const [endOfDeck, setEndOfDeck] = useState(false);
  const [hasSwiped, setHasSwiped] = useState(false);
  const handAnim = useRef(new Animated.Value(0)).current;

  // Données filtrées pour le Deck (exclut les favoris)
  // On utilise un state séparé pour ne pas re-render le Swiper à chaque Like (ce qui sauterait une carte)
  const [deckData, setDeckData] = useState([]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(handAnim, { toValue: 120, duration: 1200, useNativeDriver: true }),
        Animated.timing(handAnim, { toValue: -120, duration: 1200, useNativeDriver: true }),
        Animated.timing(handAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [handAnim]);

  // --- CHARGEMENT DES VOYAGES ---
  const fetchTrips = async () => {
    try {
      const response = await client.get('/trips');
      // On mélange pour la découverte
      setTrips(response.data.sort(() => 0.5 - Math.random()));
    } catch (error) {
      console.error("Erreur fetch trips:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // On charge les données uniquement au montage pour éviter que ça change tout le temps
  useEffect(() => {
    fetchTrips();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, []);

  // --- FILTRAGE INTELLIGENT ---
  const displayData = useMemo(() => {
      let filtered = trips;

      if (selectedTag && selectedTag !== "Tout") {
        const tagRecherche = selectedTag.toLowerCase();
        filtered = filtered.filter(trip => 
          trip.tags && Array.isArray(trip.tags) && 
          trip.tags.some(t => t.toLowerCase() === tagRecherche)
        );
      }

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

  // --- GESTION DU DECK SWIPE ---
  useEffect(() => {
      // On met à jour le deck quand les filtres changent OU qu'on active le mode swipe
      // On filtre les favoris existants pour ne pas les remontrer
      if (isSwipeMode) {
          const freshDeck = displayData.filter(t => !favoriteIds.has(t.id));
          setDeckData(freshDeck);
          setEndOfDeck(false); // Reset fin de deck
      }
  }, [displayData, isSwipeMode]); // favoriteIds est omis exprès pour éviter les sauts d'index pendant le swipe

  // --- RENDER CARD POUR SWIPER ---
  const renderCard = (trip) => {
    if (!trip) return null;
    return (
        <View style={styles.cardContainerSwiper}>
             <TripCard trip={trip} variant="swipe" />
        </View>
    );
  };

  const onSwipedRight = (cardIndex) => {
     setHasSwiped(true);
     // Attention: cardIndex est l'index dans deckData
     const trip = deckData[cardIndex];
     if (trip) {
         likeFavorite(trip.id);
     }
  };

  const onSwipedLeft = (cardIndex) => {
     setHasSwiped(true);
     const trip = deckData[cardIndex];
     if (trip) {
         dislikeFavorite(trip.id);
     }
  };

  // --- COMPOSANT : HEADER DE LA LISTE ---
  const ListHeader = () => {
    const featuredTrips = trips.slice(0, 3); 

    return (
      <View>
        <View style={{ height: showFilters ? 230 : 180 }} />

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
      <View style={isSwipeMode ? styles.floatingHeaderSwiping : styles.floatingHeader}>
        
        {/* Ligne 1 : Salutation & Toggle Mode */}
        <View style={styles.topRow}>
          <View>
             <Text style={styles.greeting}>VADRO</Text>
             <Text style={styles.subtitle}>{isSwipeMode ? "Mode Découverte ⚡️" : "Prêt pour votre prochaine évasion ?"}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
              {/* BOUTON TOGGLE SWIPE/LISTE */}
              <TouchableOpacity 
                style={[styles.modeButton, isSwipeMode && styles.modeButtonActive]}
                onPress={() => setIsSwipeMode(!isSwipeMode)}
              >
                 <Ionicons name={isSwipeMode ? "list" : "albums-outline"} size={22} color={isSwipeMode ? "#fff" : "#1A1A1A"} />
              </TouchableOpacity>

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
        </View>

        {/* Ligne 2 : Recherche & Filtres (Masqué en swipe mode) */}
        {!isSwipeMode && (
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
        )}

        {/* Ligne 3 : Tags */}
        {!isSwipeMode && showFilters && (
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

      {/* --- CONTENU PRINCIPAL --- */}
      <View style={styles.content}>
        {isSwipeMode ? (
            /* --- MODE SWIPE (TINDER) --- */
            <View style={styles.swiperContainer}>
                {deckData.length > 0 && !endOfDeck ? (
                    <Swiper
                        ref={swiperRef}
                        cards={deckData}
                        renderCard={renderCard}
                        onSwipedRight={onSwipedRight}
                        onSwipedLeft={onSwipedLeft}
                        onSwipedAll={() => setEndOfDeck(true)}
                        cardIndex={0}
                        backgroundColor={'#FAFAFA'}
                        stackSize={3}
                        cardVerticalMargin={0}
                        cardHorizontalMargin={0}
                        containerStyle={{ backgroundColor: 'transparent', flex: 1 }}
                        animateOverlayLabelsOpacity
                        animateCardOpacity
                        swipeBackCard
                        overlayLabels={{
                            left: {
                            element: (
                                <View style={[styles.swipeLabel, { borderColor: '#FF3B30', transform: [{ rotate: '30deg' }] }]}>
                                    <Text style={[styles.swipeLabelText, { color: '#FF3B30' }]}>NOPE</Text>
                                </View>
                            ),
                            style: {
                                wrapper: {
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                justifyContent: 'flex-start',
                                marginTop: 40,
                                marginLeft: -40,
                                elevation: 10
                                }
                            }
                            },
                            right: {
                            element: (
                                <View style={[styles.swipeLabel, { borderColor: '#00D668', transform: [{ rotate: '-30deg' }] }]}>
                                    <Text style={[styles.swipeLabelText, { color: '#00D668' }]}>LIKE</Text>
                                </View>
                            ),
                            style: {
                                wrapper: {
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start',
                                marginTop: 40,
                                marginLeft: 40,
                                elevation: 10
                                }
                            }
                            }
                        }}
                    >
                         {/* Ce bouton permet de swiper tout en étant en dessous de la pile, souvent inutile sauf pour "Tout vu" */}
                    </Swiper>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="documents-outline" size={60} color="#E5E5EA" />
                        <Text style={styles.emptyTitle}>{deckData.length === 0 ? "Tout est liké ! ❤️" : "Wow, vous avez tout vu ! 🚀"}</Text>
                        <Text style={styles.emptyText}>Revenez plus tard pour d'autres pépites.</Text>
                        
                        <TouchableOpacity onPress={onRefresh} style={[styles.resetButton, { marginTop: 20 }]}>
                             <Text style={styles.resetButtonText}>Actualiser la liste</Text>
                        </TouchableOpacity>
                    </View>
                )}
                
                {/* Overlay Tutorial : Main qui montre le geste sur la carte */}
                {deckData.length > 0 && !endOfDeck && !hasSwiped && (
                     <View style={styles.tutorialOverlay} pointerEvents="none">
                         {/* Hand Animation */}
                         <Animated.View style={{ 
                             transform: [
                                 { translateX: handAnim },
                                 { rotate: handAnim.interpolate({ inputRange: [-150, 150], outputRange: ['-15deg', '15deg'] }) }
                             ] 
                         }}>
                            <View style={styles.handCircle}>
                                <Ionicons name="hand-right" size={40} color="#fff" />
                            </View>
                         </Animated.View>

                         {/* Feedback Icons qui apparaissent avec le geste */}
                         <Animated.View style={[styles.tutorialFeedback, { 
                             right: 40,
                             opacity: handAnim.interpolate({ inputRange: [0, 100], outputRange: [0, 1], extrapolate: 'clamp' }),
                             transform: [{ scale: handAnim.interpolate({ inputRange: [0, 100], outputRange: [0.5, 1], extrapolate: 'clamp' }) }]
                         }]}>
                             <View style={[styles.swipeLabel, { borderColor: '#00D668', transform: [{ rotate: '-30deg' }] }]}>
                                <Text style={[styles.swipeLabelText, { color: '#00D668' }]}>LIKE</Text>
                             </View>
                         </Animated.View>

                         <Animated.View style={[styles.tutorialFeedback, { 
                             left: 40,
                             opacity: handAnim.interpolate({ inputRange: [-100, 0], outputRange: [1, 0], extrapolate: 'clamp' }),
                             transform: [{ scale: handAnim.interpolate({ inputRange: [-100, 0], outputRange: [1, 0.5], extrapolate: 'clamp' }) }]
                         }]}>
                             <View style={[styles.swipeLabel, { borderColor: '#FF3B30', transform: [{ rotate: '30deg' }] }]}>
                                <Text style={[styles.swipeLabelText, { color: '#FF3B30' }]}>NOPE</Text>
                             </View>
                         </Animated.View>
                     </View>
                )}
            </View>

        ) : (
            /* --- MODE LISTE (Classique) --- */
            <FlatList
            data={displayData}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={renderFooter}
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
        )}
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
    backgroundColor: 'rgba(250,250,250,0.96)', 
    paddingTop: 55, paddingBottom: 15, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  floatingHeaderSwiping: {
    // En mode swipe, on garde le header mais il prend de la place, 
    // peut-être qu'on veut qu'il soit opaque.
    zIndex: 100,
    backgroundColor: 'rgba(250,250,250,1)', 
    paddingTop: 55, paddingBottom: 15, paddingHorizontal: 20,
  },
  
  // Identité
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  greeting: { fontSize: 24, fontWeight: '900', color: '#1A1A1A', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#8E8E93', fontWeight: '500', marginTop: 2 },
  
  avatarContainer: { shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 5, elevation: 5 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#fff' },
  modeButton: { 
      width: 44, height: 44, borderRadius: 16, backgroundColor: '#fff', 
      justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F2F2F7', marginRight: 0 
  },
  modeButtonActive: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },

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
  // Pour le swiper, on doit compenser le header absolu
  swiperContainer: { flex: 1, paddingTop: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }, 
  cardContainerSwiper: { 
      flex: 1, 
      borderRadius: 30, 
      height: height * 0.75, // Plus grand
      marginTop: 20, // Un peu d'espace avec le header
      marginBottom: 0,
      shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  
  swipeLabel: {
    borderWidth: 4, borderRadius: 10, padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  swipeLabelText: {
    fontSize: 32, fontWeight: '900', letterSpacing: 2
  },

  swipeButtons: {
      position: 'absolute', bottom: 110, flexDirection: 'row', gap: 30, zIndex: 999 
  },
  
  tutorialOverlay: {
      position: 'absolute', 
      top: 0, bottom: 0, left: 0, right: 0, 
      alignItems: 'center', justifyContent: 'center', 
      zIndex: 20
  },
  
  handCircle: {
      width: 70, height: 70, borderRadius: 35,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center', alignItems: 'center',
      borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)',
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6
  },

  tutorialFeedback: {
      position: 'absolute', top: 100,
  },

  roundButton: {
      width: 60, height: 60, borderRadius: 30,
      justifyContent: 'center', alignItems: 'center',
      shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6
  },

  cardWrapper: { paddingHorizontal: 20, marginBottom: 5 }, 
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