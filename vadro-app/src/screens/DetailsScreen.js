// src/screens/TripDetailsScreen.js
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const TripDetailsScreen = ({ route, navigation }) => {
  // On récupère les infos du voyage passées par la navigation
  const { trip } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. IMAGE DE FOND IMMERSIVE */}
      <Image 
        source={{ uri: trip.image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1' }} 
        style={styles.headerImage} 
      />

      {/* 2. BOUTONS FLOTTANTS (Retour & Like) */}
      <SafeAreaView style={styles.headerButtons}>
        <TouchableOpacity style={styles.roundButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundButton}>
          <Ionicons name="heart-outline" size={24} color="#000" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* 3. CONTENU DÉTAILLÉ (Sheet blanche) */}
      <View style={styles.contentContainer}>
        <View style={styles.dragHandle} />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Titre & Prix */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{trip.title}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={16} color="#00D668" />
                <Text style={styles.locationText}>France • {trip.days} jours</Text>
              </View>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{trip.price}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>
            Découvrez ce voyage incroyable à travers des paysages époustouflants. 
            Un itinéraire parfaitement équilibré entre aventure et détente, conçu par nos experts locaux.
            Idéal pour les amateurs de nature et de photographie.
          </Text>

          {/* Stats Rapides */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="walk" size={24} color="#00D668" />
              <Text style={styles.statLabel}>Moyen</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={24} color="#00D668" />
              <Text style={styles.statLabel}>2-4 pers.</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={24} color="#00D668" />
              <Text style={styles.statLabel}>4.8/5</Text>
            </View>
          </View>

          {/* Bouton d'action (Sticky Bottom) */}
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Remixer ce voyage</Text>
            <Ionicons name="shuffle" size={20} color="#fff" />
          </TouchableOpacity>

        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  
  headerImage: { width: width, height: height * 0.5, resizeMode: 'cover', opacity: 0.9 },
  
  headerButtons: {
    position: 'absolute', top: 0, width: '100%',
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10
  },
  roundButton: {
    width: 45, height: 45, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 5
  },

  contentContainer: {
    position: 'absolute', bottom: 0,
    width: width, height: height * 0.65, // Prend 65% de l'écran
    backgroundColor: '#fff',
    borderTopLeftRadius: 35, borderTopRightRadius: 35,
    paddingHorizontal: 25, paddingTop: 10,
  },
  dragHandle: {
    width: 50, height: 5, borderRadius: 3, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 20, marginTop: 10
  },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 5, width: '70%' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationText: { color: '#8E8E93', fontSize: 14, fontWeight: '500' },

  priceTag: { backgroundColor: '#E8FAF0', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 12 },
  priceText: { color: '#00D668', fontWeight: 'bold', fontSize: 18 },

  divider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 20 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#1A1A1A' },
  description: { fontSize: 15, color: '#666', lineHeight: 24 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 40 },
  statItem: { alignItems: 'center', backgroundColor: '#FAFAFA', padding: 15, borderRadius: 15, width: '30%' },
  statLabel: { marginTop: 8, fontSize: 12, fontWeight: '600', color: '#333' },

  actionButton: {
    backgroundColor: '#00D668',
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 18, borderRadius: 20,
    gap: 10,
    shadowColor: "#00D668", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, elevation: 10
  },
  actionText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default TripDetailsScreen;