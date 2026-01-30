import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// --- DONNÉES DE TEST (Voyages) ---
const TRIPS = [
  { id: 1, title: "Roadtrip en Italie", price: "450€", lat: 43.7696, lng: 11.2558, image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9" },
  { id: 2, title: "Surf à Biarritz", price: "280€", lat: 43.4832, lng: -1.5586, image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f" },
  { id: 3, title: "Week-end à Paris", price: "150€", lat: 48.8566, lng: 2.3522, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34" },
  { id: 4, title: "Rando Alpes", price: "120€", lat: 45.9237, lng: 6.8694, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b" },
];

// --- STYLE DE CARTE "CLEAN" (JSON Google Maps) ---
// Cela retire les commerces et allège la carte pour un look pro
const MAP_STYLE = [
  { "featureType": "poi", "elementType": "labels.text", "stylers": [{ "visibility": "off" }] },
  { "featureType": "poi.business", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "featureType": "transit", "stylers": [{ "visibility": "off" }] }
];

const MapScreen = () => {
  const [selectedTrip, setSelectedTrip] = useState(null);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <MapView
        style={styles.map}
        // provider={PROVIDER_GOOGLE} // Décommente si tu es sur Android pour forcer Google Maps
        customMapStyle={MAP_STYLE}
        initialRegion={{
          latitude: 46.603354, // Centre de la France
          longitude: 1.888334,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
        onPress={() => setSelectedTrip(null)} // Ferme la carte si on clique ailleurs
      >
        {TRIPS.map((trip) => (
          <Marker
            key={trip.id}
            coordinate={{ latitude: trip.lat, longitude: trip.lng }}
            onPress={() => setSelectedTrip(trip)}
          >
            {/* --- LE MARKER PERSONNALISÉ --- */}
            <View style={[
              styles.markerContainer, 
              selectedTrip?.id === trip.id && styles.markerSelected // Change de style si sélectionné
            ]}>
              <Text style={[
                styles.markerText,
                selectedTrip?.id === trip.id && styles.markerTextSelected
              ]}>
                {trip.price}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* --- BOUTON DE RECHERCHE FLOTTANT (Haut) --- */}
      <SafeAreaView style={styles.topContainer} pointerEvents="box-none">
        <View style={styles.searchPill}>
          <Ionicons name="search" size={16} color="#00D668" />
          <Text style={styles.searchText}>Rechercher dans cette zone</Text>
        </View>
      </SafeAreaView>

      {/* --- CARTE D'INFO EN BAS (Si un voyage est sélectionné) --- */}
      {selectedTrip && (
        <View style={styles.tripCardContainer}>
          <View style={styles.tripCard}>
            <Image source={{ uri: selectedTrip.image }} style={styles.cardImage} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{selectedTrip.title}</Text>
              <Text style={styles.cardPrice}>À partir de {selectedTrip.price}</Text>
              <TouchableOpacity style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Voir</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            {/* Bouton Fermer */}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setSelectedTrip(null)}
            >
              <Ionicons name="close" size={20} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: width, height: height }, // Prend TOUT l'écran, même sous la navbar

  // --- MARKER ---
  markerContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  markerSelected: {
    backgroundColor: '#00D668', // Vert Virote quand sélectionné
    borderColor: '#00D668',
    transform: [{ scale: 1.1 }]
  },
  markerText: { fontWeight: 'bold', fontSize: 13, color: '#1A1A1A' },
  markerTextSelected: { color: '#FFFFFF' },

  // --- TOP SEARCH ---
  topContainer: { position: 'absolute', top: 20, width: '100%', alignItems: 'center' },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    gap: 8,
  },
  searchText: { fontWeight: '600', color: '#1A1A1A', fontSize: 14 },

  // --- TRIP CARD (Bottom Sheet) ---
  tripCardContainer: {
    position: 'absolute',
    bottom: 110, // Juste au dessus de la Navbar (70px + marge)
    left: 20,
    right: 20,
  },
  tripCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center'
  },
  cardImage: { width: 70, height: 70, borderRadius: 14, marginRight: 15 },
  cardInfo: { flex: 1 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#1A1A1A', marginBottom: 4 },
  cardPrice: { fontSize: 13, color: '#8E8E93', marginBottom: 8 },
  
  cardButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#00D668', 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 10, 
    alignSelf: 'flex-start',
    gap: 5
  },
  cardButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

  closeButton: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: '#F2F2F7', padding: 5, borderRadius: 15
  }
});

export default MapScreen;