import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';

const { width, height } = Dimensions.get('window');

// 📏 TAILLE EXACTE DE LA CARTE (Doit correspondre aux calculs du HomeScreen)
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.65;

const TripCard = ({ trip }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleRemix = async () => {
    setLoading(true);
    try {
      const response = await client.post(`/trips/${trip.id}/remix`, { newAuthorId: 1 });
      if (response.data.success) {
        Alert.alert("🔥 Voyage ajouté !", "Prêt à le personnaliser ?", [
          { text: "C'est parti", onPress: () => navigation.navigate('MapScreen', { tripId: response.data.remix.id }) }
        ]);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de remixer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // PLUS DE MARGIN ICI, C'EST GÉRÉ PAR LE SWIPER
    <View style={styles.card}>
      
      {/* IMAGE (72%) */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: trip.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800' }} 
          style={styles.image} 
        />
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{trip.tags?.[0] || 'Roadtrip'}</Text>
        </View>
      </View>

      {/* INFOS (28%) */}
      <View style={styles.infoContainer}>
        <View style={styles.textRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{trip.title}</Text>
            <Text style={styles.subtitle}>{trip.distanceKm} km • {trip.durationDays} j • {trip.budgetEuro}€</Text>
          </View>
          <View style={styles.likeButton}>
              <Ionicons name="heart" size={22} color="#FF3B30" />
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={handleRemix} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.actionText}>Remixer</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    // Ombre douce
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'visible', // Important pour l'ombre sur iOS
  },
  imageContainer: {
    flex: 0.72,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  tagBadge: {
    position: 'absolute', top: 15, left: 15,
    backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  tagText: { fontWeight: '800', fontSize: 11, textTransform: 'uppercase', color: '#000' },
  
  infoContainer: {
    flex: 0.28, padding: 18, justifyContent: 'space-between',
  },
  textRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  
  likeButton: { padding: 8, backgroundColor: '#FFF0F0', borderRadius: 50, marginLeft: 10 },
  
  actionButton: {
    backgroundColor: '#00D668', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 12, borderRadius: 14, gap: 8,
  },
  actionText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});

export default TripCard;