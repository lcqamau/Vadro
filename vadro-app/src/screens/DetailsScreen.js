import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, ActivityIndicator, FlatList, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics'; // Pour la vibration
import client from '../api/client'; // Ton client sécurisé
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.55;

// --- HELPER : Icônes ---
const getStepIcon = (type) => {
  switch (type) {
    case 'sleep': return 'bed';
    case 'eat': return 'silverware-fork-knife';
    case 'activity': return 'hiking';
    case 'spot': return 'camera';
    case 'start': return 'flag-checkered';
    case 'end': return 'home';
    default: return 'map-marker';
  }
};

// --- HELPER : Groupement ---
const groupStepsByDay = (steps) => {
  if (!steps || steps.length === 0) return [];
  
  const grouped = steps.reduce((acc, step) => {
    if (!acc[step.day]) acc[step.day] = [];
    acc[step.day].push(step);
    return acc;
  }, {});

  return Object.keys(grouped)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(day => ({
      day: parseInt(day),
      steps: grouped[day]
    }));
};

const TripDetailsScreen = ({ route, navigation }) => {
  const { trip } = route.params;

  // --- ÉTATS ---
  const [steps, setSteps] = useState([]); 
  const [loadingSteps, setLoadingSteps] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  
  // GESTION FAVORIS : On initialise avec la donnée si elle existe (ex: venant de Wishlist)
  const [isFavorite, setIsFavorite] = useState(trip.likedAt ? true : false);

  // Gestion des images
  const images = (trip.images && trip.images.length > 0) 
    ? trip.images 
    : [trip.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1'];

  // --- 1. VÉRIFIER LE STATUT FAVORI (API) ---
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        // On demande au backend si c'est liké
        const res = await client.get(`/favorites/${trip.id}/check`, {
          headers: { Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}` }
        });
        setIsFavorite(res.data.isFavorite);
      } catch (error) {
        // Silencieux si erreur (ex: pas connecté), on garde la valeur par défaut
        console.log("Info: Check favori impossible (ou non connecté)");
      }
    };

    // Si on ne sait pas déjà (via la navigation), on vérifie
    if (trip.likedAt === undefined) {
      checkFavoriteStatus();
    }
  }, [trip.id]);

  // --- 2. CHARGEMENT DES ÉTAPES ---
  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const response = await client.get(`/trips/${trip.id}/steps`);
        setSteps(response.data);
      } catch (err) {
        console.error("Erreur chargement steps:", err);
      } finally {
        setLoadingSteps(false);
      }
    };
    fetchSteps();
  }, [trip.id]);

  // --- 3. FONCTION TOGGLE LIKE ---
  const handleToggleFavorite = async () => {
    // A. Vibration
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // B. UI Optimiste
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);

    try {
      // C. Appel API
      await client.post(`/favorites/${trip.id}` , {}, {
        headers: { Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}` }
      });
    } catch (error) {
      // D. Rollback si erreur
      console.error("Erreur toggle:", error);
      setIsFavorite(previousState);
      Alert.alert("Erreur", "Impossible de modifier les favoris (vérifiez votre connexion)");
    }
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveSlide(viewableItems[0].index || 0);
    }
  }, []);

  const groupedSteps = groupStepsByDay(steps);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* --- HEADER & NAVIGATION --- */}
      <SafeAreaView style={styles.headerButtons}>
        <TouchableOpacity style={styles.glassButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={{flexDirection: 'row', gap: 10}}>
            <TouchableOpacity style={styles.glassButton}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
            
            {/* BOUTON CŒUR CONNECTÉ */}
            <TouchableOpacity 
              style={styles.glassButton} 
              onPress={handleToggleFavorite}
              activeOpacity={0.7}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#FF3B30" : "#fff"} 
              />
            </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        bounces={false}
      >
        
        {/* --- CAROUSEL --- */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image 
                source={{ uri: item }} 
                style={styles.headerImage} 
                contentFit="cover"
                transition={300}
              />
            )}
          />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.gradientOverlay} />

          {/* Pagination */}
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === activeSlide ? styles.dotActive : styles.dotInactive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* --- SHEET CONTENU --- */}
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />

          <View style={styles.headerInfo}>
            <View style={styles.topMeta}>
                <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{trip.tags?.[0] || 'VOYAGE'}</Text>
                </View>
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="#1A1A1A" />
                    <Text style={styles.ratingText}>4.9 (12 avis)</Text>
                </View>
            </View>

            <Text style={styles.title}>{trip.title}</Text>
            
            <View style={styles.authorRow}>
                <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' }} 
                    style={styles.authorAvatar} 
                />
                <View>
                    <Text style={styles.authorLabel}>Créé par</Text>
                    <Text style={styles.authorName}>L'Explorateur</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsGrid}>
               <View style={styles.statItem}>
                 <View style={[styles.statIconBox, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="time" size={20} color="#00D668" />
                 </View>
                 <Text style={styles.statLabel}>Durée</Text>
                 <Text style={styles.statValue}>{trip.durationDays} Jours</Text>
               </View>
               <View style={[styles.verticalDivider]} />
               <View style={styles.statItem}>
                 <View style={[styles.statIconBox, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="wallet" size={20} color="#2196F3" />
                 </View>
                 <Text style={styles.statLabel}>Budget</Text>
                 <Text style={styles.statValue}>{trip.budgetEuro} €</Text>
               </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>L'Expérience</Text>
          <Text style={styles.description}>
            {trip.description || "Préparez-vous pour une aventure inoubliable à travers des paysages époustouflants et une culture riche."}
          </Text>

          <Text style={styles.sectionTitle}>Votre Itinéraire</Text>

          {loadingSteps ? (
            <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
          ) : steps.length > 0 ? (
            <View style={styles.timelineContainer}>
              {groupedSteps.map((group, groupIndex) => (
                <View key={groupIndex} style={styles.daySection}>
                  <View style={styles.leftColumn}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayText}>J{group.day}</Text>
                    </View>
                    {groupIndex !== groupedSteps.length - 1 && <View style={styles.verticalLine} />}
                  </View>

                  <View style={styles.rightColumn}>
                    {group.steps.map((step, stepIndex) => (
                      <View key={stepIndex} style={styles.stepCardWrapper}>
                        <View style={styles.visualCard}>
                          {step.imageUrl ? (
                             <Image source={{ uri: step.imageUrl }} style={styles.cardImage} contentFit="cover" />
                          ) : (
                             <View style={[styles.cardImage, { backgroundColor: '#F0F0F0' }]} />
                          )}
                          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardOverlay} />
                          <View style={styles.cardContent}>
                             <View style={styles.cardHeader}>
                               <View style={styles.iconBadge}>
                                 <MaterialCommunityIcons name={getStepIcon(step.type)} size={14} color="#000" />
                               </View>
                               <Text style={styles.stepType}>{step.type?.toUpperCase()}</Text>
                             </View>
                             <Text style={styles.stepTitle}>{step.title}</Text>
                          </View>
                        </View>
                        <Text style={styles.stepDesc}>{step.description}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Aucune étape pour ce voyage.</Text>
          )}

        </View>
      </ScrollView>

      {/* --- BOTTOM BAR --- */}
      <View style={styles.bottomBarWrapper}>
          <View style={styles.bottomBarGlass}>
            <View>
            <Text style={styles.priceLabel}>Prix total estimé</Text>
            <View style={{flexDirection:'row', alignItems:'baseline'}}>
                <Text style={styles.totalPrice}>{trip.budgetEuro}€</Text>
                <Text style={{color:'#666', fontSize:12}}> / pers</Text>
            </View>
            </View>
            <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Réserver</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  carouselContainer: { height: HEADER_HEIGHT, width: width },
  headerImage: { width: width, height: HEADER_HEIGHT, backgroundColor: '#000' },
  gradientOverlay: { position: 'absolute', bottom: 0, width: '100%', height: 100 },
  
  pagination: {
    position: 'absolute', bottom: 40, width: '100%',
    flexDirection: 'row', justifyContent: 'center', gap: 8
  },
  dot: { borderRadius: 4, height: 6 },
  dotActive: { width: 20, backgroundColor: '#fff' },
  dotInactive: { width: 6, backgroundColor: 'rgba(255,255,255,0.5)' },

  headerButtons: { 
    position: 'absolute', top: 0, width: '100%', 
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 50, paddingTop: 10
  },
  glassButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)'
  },

  sheetContainer: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 32, borderTopRightRadius: 32, 
    marginTop: -30,
    minHeight: height * 0.6, padding: 25,
    paddingBottom: 50
  },
  dragHandle: { 
    width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 25 
  },

  topMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tagBadge: { backgroundColor: '#000', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  ratingText: { fontWeight: '600', fontSize: 12 },

  title: { fontSize: 28, fontWeight: '900', color: '#1A1A1A', marginBottom: 15, letterSpacing: -0.5, lineHeight: 32 },

  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  authorAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  authorLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase', fontWeight: 'bold' },
  authorName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },

  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FAFAFA', padding: 15, borderRadius: 16 },
  statItem: { alignItems: 'center', flex: 1 },
  statIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  verticalDivider: { width: 1, height: 40, backgroundColor: '#E0E0E0' },

  sectionTitle: { fontSize: 22, fontWeight: '800', marginBottom: 15, marginTop: 30, color: '#1A1A1A' },
  description: { fontSize: 16, color: '#555', lineHeight: 26 },

  timelineContainer: { paddingLeft: 0 },
  daySection: { flexDirection: 'row', marginBottom: 0 },
  leftColumn: { width: 40, alignItems: 'center', marginRight: 15 },
  dayBadge: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center', zIndex: 10, marginBottom: 5,
    borderWidth: 2, borderColor: '#fff'
  },
  dayText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  verticalLine: { width: 2, flex: 1, backgroundColor: '#E5E5EA', marginBottom: -10 },
  
  rightColumn: { flex: 1, paddingBottom: 30 },
  stepCardWrapper: { marginBottom: 20 },
  visualCard: {
    height: 160, borderRadius: 20, overflow: 'hidden', 
    backgroundColor: '#F0F0F0', marginBottom: 10, justifyContent: 'flex-end',
    shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, elevation: 5
  },
  cardImage: { ...StyleSheet.absoluteFillObject },
  cardOverlay: { ...StyleSheet.absoluteFillObject },
  cardContent: { padding: 15 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  iconBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  stepType: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '800' },
  stepTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 4 },
  stepDesc: { fontSize: 14, color: '#666', lineHeight: 20 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' },

  bottomBarWrapper: {
    position: 'absolute', bottom: 0, width: '100%',
    paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10,
  },
  bottomBarGlass: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 15, borderRadius: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
    borderWidth: 1, borderColor: '#F5F5F5'
  },
  priceLabel: { fontSize: 10, color: '#888', fontWeight: '600', textTransform: 'uppercase' },
  totalPrice: { fontSize: 24, fontWeight: '900', color: '#1A1A1A' },
  bookButton: { 
    backgroundColor: '#1A1A1A', paddingHorizontal: 25, paddingVertical: 14, borderRadius: 18, 
    flexDirection: 'row', alignItems: 'center', gap: 8 
  },
  bookButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default TripDetailsScreen;