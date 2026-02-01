import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics'; // Vibration (si installé)
import apiClient from '../api/client'; // Ton client configuré
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// --- RÉGLAGES DIMENSIONS CARRÉES ---
const CARD_MARGIN = 0; // Si tu veux coller aux bords ou mettre 20
const CARD_WIDTH = width - (CARD_MARGIN * 2); 
const IMAGE_HEIGHT = CARD_WIDTH; 

const TripCard = ({ trip }) => {
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Initialisation de l'état local avec la prop
  const [isFavorite, setIsFavorite] = useState(trip.likedAt ? true : false);

  // --- 1. LE FIX DE SYNCHRONISATION ---
  // C'est ici que la magie opère : quand la Home rafraîchit les données,
  // ce useEffect force la mise à jour du cœur sur la carte.
  useEffect(() => {
    if (trip.likedAt !== undefined) {
      setIsFavorite(trip.likedAt ? true : false);
    }
  }, [trip.likedAt]); // On surveille le changement de cette donnée précise

  // --- 2. FONCTION TOGGLE (Nettoyée) ---
  const handleToggleFavorite = async () => {
    // Vibration (Optionnel)
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}

    // UI Optimiste
    const previousState = isFavorite;
    setIsFavorite(!isFavorite); 

    try {
      // Appel API simplifié (le client gère le token tout seul)
      await apiClient.post(`/favorites/${trip.id}` ,  {}, {
        headers: { Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}` }
      });
      
    } catch (error) {
      console.error("Erreur Like/Dislike :", error);
      // Rollback en cas d'erreur
      setIsFavorite(previousState);
    }
  };

  // --- GESTION IMAGES ---
  const images = (trip.images && trip.images.length > 0) 
    ? trip.images 
    : [trip.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1'];

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const handlePress = () => navigation.navigate('TripDetails', { trip });

  return (
    <View style={styles.container}>
      
      {/* 1. CAROUSEL FORMAT CARRÉ */}
      <View style={styles.imageWrapper}>
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          decelerationRate="fast" 
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={16}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={1} onPress={handlePress}>
              <Image 
                source={{ uri: item }} 
                contentFit="cover" 
                transition={300}
                style={styles.image} 
              />
            </TouchableOpacity>
          )}
        />

        {/* Dégradé bas */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.gradient}
        />

        {/* Bouton Like */}
        <TouchableOpacity 
          style={styles.likeButton}
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

        {/* Pagination Dots */}
        {images.length > 1 && (
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === activeIndex ? styles.dotActive : styles.dotInactive
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* 2. INFO SECTION */}
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.infoContainer}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>{trip.title}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#1A1A1A" />
            <Text style={styles.ratingText}>{trip.rating || "4.8"}</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          {trip.durationDays} jours • {trip.tags?.[0] || 'Voyage'}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>dès </Text>
          <Text style={styles.priceValue}>{trip.budgetEuro} €</Text>
          <Text style={styles.priceLabel}> / pers</Text>
        </View>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 25, 
    // Si tu avais mis des marges sur CARD_WIDTH, il faut les gérer ici ou dans le parent
    // marginHorizontal: CARD_MARGIN, 
    
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 6,
  },

  imageWrapper: {
    height: IMAGE_HEIGHT, 
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F0F0F0'
  },
  image: { width: CARD_WIDTH, height: IMAGE_HEIGHT },
  
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },

  likeButton: {
    position: 'absolute', top: 12, right: 12,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.2)', 
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
  },

  pagination: {
    position: 'absolute', bottom: 12, width: '100%',
    flexDirection: 'row', justifyContent: 'center', gap: 6
  },
  dot: { borderRadius: 3 },
  dotActive: { width: 8, height: 8, backgroundColor: '#fff' },
  dotInactive: { width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.6)' },

  infoContainer: { padding: 18, paddingBottom: 22 },
  
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', flex: 1, marginRight: 10, letterSpacing: -0.5 },
  
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F7F7F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },

  subtitle: { fontSize: 14, color: '#8E8E93', fontWeight: '500', marginBottom: 16 },

  priceContainer: { flexDirection: 'row', alignItems: 'baseline', alignSelf: 'flex-end' },
  priceLabel: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  priceValue: { fontSize: 22, fontWeight: '900', color: '#1A1A1A' }
});

export default TripCard;