import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useFavorites } from '../context/FavoritesContext';

const { width } = Dimensions.get('window');

// --- RÉGLAGES DIMENSIONS CARRÉES ---
const CARD_MARGIN = 0; 
const CARD_WIDTH = width - (CARD_MARGIN * 2); 
const IMAGE_HEIGHT = CARD_WIDTH; 

const TripCard = ({ trip, variant = 'card' }) => {
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Utilisation du contexte global pour les favoris
  const { isFavorite, toggleFavorite } = useFavorites();
  const liked = isFavorite(trip.id);

  const handleToggleFavorite = () => {
    toggleFavorite(trip.id);
  };

  // --- GESTION IMAGES ---
  const images = (trip.images && trip.images.length > 0) 
    ? trip.images 
    : [trip.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1'];

  const handlePress = () => navigation.navigate('TripDetails', { trip });

  // --- RENDER : MODE SWIPE (FULL CARD) ---
  if (variant === 'swipe') {
    return (
      <TouchableOpacity activeOpacity={0.95} onPress={handlePress} style={styles.swipeContainer}>
         <Image 
            source={{ uri: images[0] }} 
            contentFit="cover" 
            style={styles.swipeImage} 
            transition={300}
         />
         <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.9)']}
            locations={[0, 0.6, 1]}
            style={styles.swipeGradient}
         />
         
         {/* Badge Tag */}
         <View style={styles.swipeTagContainer}>
            <Text style={styles.swipeTagProp}>{trip.tags?.[0] || 'VOYAGE'}</Text>
         </View>

         {/* Contenu Flou */}
         {/* Contenu Flou */}
         <View style={styles.swipeContentWrapper}>
            <BlurView intensity={30} tint="light" style={styles.swipeContentBlur}>
                <View>
                    <Text style={styles.swipeTitle} numberOfLines={2}>{trip.title}</Text>
                    
                    <View style={styles.swipeRow}>
                        <View style={styles.swipeIconInfo}>
                            <Ionicons name="time-outline" size={16} color="#1A1A1A" />
                            <Text style={styles.swipeText}>{trip.durationDays}J</Text>
                        </View>
                        <View style={styles.swipeIconInfo}>
                            <Ionicons name="star" size={16} color="#FFE500" />
                            <Text style={styles.swipeText}>{trip.rating || "4.8"}</Text>
                        </View>
                    </View>

                    <View style={styles.swipePriceContainer}>
                        <Text style={styles.swipePriceLabel}>Dès </Text>
                        <Text style={styles.swipePrice}>{trip.budgetEuro} €</Text>
                    </View>
                </View>
            </BlurView>
         </View>
         
      </TouchableOpacity>
    );
  }

  // --- RENDER : MODE CARTE (LISTE) ---
  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

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
            name={liked ? "heart" : "heart-outline"} 
            size={24} 
            color={liked ? "#FF3B30" : "#fff"} 
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
  // --- STYLE CLASSIQUE ---
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 25, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 6,
  },
  
  // --- SYLES DU MODE SWIPE (TINDER) ---
  // --- SYLES DU MODE SWIPE (TINDER) ---
  swipeContainer: {
    width: CARD_WIDTH,
    height: '70%' ,
    borderRadius: 32, // Plus arrondi
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#fff' // Bordure blanche subtile
  },
  swipeImage: { width:CARD_WIDTH, height: '100%' },
  // Dégradé plus doux juste pour assurer la lisibilité si le texte dépasse
  swipeGradient: { position: 'absolute', bottom: 0, width: '100%', height: '40%' },
  
  // Contenu façon "Carte flottante" en bas
  // Contenu façon "Carte flottante" en bas
  swipeContentWrapper: {
      position: 'absolute', bottom: 20, left: 20, right: 20,
      shadowColor: "#939191", 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      backgroundColor: 'transparent'
  },
  swipeContentBlur: {
      padding: 20,
      borderRadius: 24,
      overflow: 'hidden', // IMPORTANT pour l'arrondi du BlurView
      backgroundColor: 'rgba(255, 255, 255, 0.45)', // Effet givré
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)'
  },
  
  swipeTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  
  swipeTitle: { 
      fontSize: 22, fontWeight: '800', color: '#1A1A1A', 
      flex: 1, marginRight: 10, lineHeight: 26
  },

  swipeRow: { flexDirection: 'row', gap: 10, marginBottom: 15, marginTop: 5 },
  swipeIconInfo: { 
      flexDirection: 'row', alignItems: 'center', gap: 6, 
      backgroundColor: '#F5F5F7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
  },
  swipeText: { color: '#1A1A1A', fontWeight: '700', fontSize: 12 },
  
  swipeTagContainer: {
      position: 'absolute', top: 20, left: 20, // Tag en haut à gauche
      backgroundColor: '#1A1A1A', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
  },
  swipeTagProp: { fontSize: 11, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },

  swipePriceContainer: {  flexDirection: 'row', alignItems: 'baseline', alignSelf: 'flex-end' },
  swipePriceLabel:{ fontSize: 13, fontWeight: '500' },
  swipePrice: { fontSize: 20, fontWeight: '900', color: '#4dbe84ff' },

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