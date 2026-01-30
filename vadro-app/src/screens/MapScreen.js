import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, StatusBar } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
// 👇 1. IMPORT TRÈS IMPORTANT POUR LA NAVIGATION
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// --- DONNÉES ---
const DATA = [
  {
    id: 'fr',
    name: 'France',
    lat: 46.603354, lng: 1.888334,
    zoom: 6,
    zones: [
      {
        id: 'z1', name: 'Alpes', lat: 45.5, lng: 6.5,
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
        trips: [
          { id: 101, title: 'Tour du Mont Blanc', days: 7, price: '600€' },
          { id: 102, title: 'Lac d\'Annecy & Rando', days: 3, price: '250€' },
        ]
      },
      {
        id: 'z2', name: 'Côte d\'Azur', lat: 43.5, lng: 6.8,
        image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077',
        trips: [
          { id: 103, title: 'Roadtrip Nice-Monaco', days: 4, price: '400€' },
        ]
      },
      {
        id: 'z3', name: 'Paris & Île-de-France', lat: 48.85, lng: 2.35,
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
        trips: [
          { id: 104, title: 'Romance à Paris', days: 2, price: '300€' },
          { id: 105, title: 'Châteaux de la Loire', days: 5, price: '550€' },
        ]
      }
    ]
  },
  {
    id: 'it',
    name: 'Italie',
    lat: 42.50, lng: 12.50,
    zoom: 6,
    zones: [
      {
        id: 'z4', name: 'Toscane', lat: 43.4, lng: 11.0,
        image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9',
        trips: [
          { id: 201, title: 'Vignobles & Florence', days: 6, price: '700€' },
        ]
      },
      {
        id: 'z5', name: 'Dolomites', lat: 46.4, lng: 11.8,
        image: 'https://images.unsplash.com/photo-1520769945061-0a448c463865',
        trips: [
          { id: 202, title: 'Ski & Lacs', days: 5, price: '650€' },
        ]
      }
    ]
  },
  {
    id: 'jp',
    name: 'Japon',
    lat: 36.2048, lng: 138.2529,
    zoom: 5,
    zones: [
      {
        id: 'z6', name: 'Kyoto & Osaka', lat: 34.8, lng: 135.6,
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
        trips: [
          { id: 301, title: 'Temples & Sushi', days: 10, price: '1800€' },
        ]
      }
    ]
  }
];

const MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
];

const MapScreen = () => {
  // 👇 2. ON INITIALISE LA NAVIGATION ICI
  const navigation = useNavigation();
  
  const mapRef = useRef(null);
  const [viewLevel, setViewLevel] = useState('WORLD'); 
  const [activeCountry, setActiveCountry] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  const handleCountryPress = (country) => {
    setActiveCountry(country);
    setViewLevel('COUNTRY');
    setSelectedZone(null);
    mapRef.current.animateToRegion({
      latitude: country.lat,
      longitude: country.lng,
      latitudeDelta: 8,
      longitudeDelta: 8,
    }, 1000);
  };

  const handleZonePress = (zone) => {
    // Petit hack pour être sûr que la Map ne vole pas le clic
    setTimeout(() => {
      setSelectedZone(zone);
    }, 50);
  };

  const handleBack = () => {
    if (selectedZone) {
      setSelectedZone(null);
    } else {
      setViewLevel('WORLD');
      setActiveCountry(null);
      mapRef.current.animateToRegion({
        latitude: 20,
        longitude: 0,
        latitudeDelta: 60,
        longitudeDelta: 60,
      }, 1000);
    }
  };

  // 👇 3. FONCTION POUR ALLER AU DÉTAIL
  const goToDetails = (trip, image) => {
    // On navigue vers l'écran 'TripDetails' en passant les infos
    navigation.navigate('TripDetails', { trip: { ...trip, image: image } });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={MAP_STYLE}
        initialRegion={{
          latitude: 46, longitude: 2, latitudeDelta: 50, longitudeDelta: 50
        }}
        onPress={() => {
           // Si on clique sur la carte (hors marqueur), on ferme la liste
           if (selectedZone) setSelectedZone(null);
        }}
      >
        {/* VUE MONDE */}
        {viewLevel === 'WORLD' && DATA.map((country) => (
          <Marker
            key={country.id}
            coordinate={{ latitude: country.lat, longitude: country.lng }}
            onPress={(e) => {
              e.stopPropagation(); // Empêche la carte de fermer
              handleCountryPress(country);
            }}
          >
            <View style={styles.countryMarker}>
              <Text style={styles.countryText}>{country.name}</Text>
            </View>
          </Marker>
        ))}

        {/* VUE PAYS */}
        {viewLevel === 'COUNTRY' && activeCountry && activeCountry.zones.map((zone) => (
          <Marker
            key={zone.id}
            coordinate={{ latitude: zone.lat, longitude: zone.lng }}
            onPress={(e) => {
              e.stopPropagation();
              handleZonePress(zone);
            }}
          >
            <View style={[
              styles.zoneMarker, 
              selectedZone?.id === zone.id && styles.zoneMarkerSelected
            ]}>
              <View style={styles.zoneDot} />
              <Text style={styles.zoneText}>{zone.name}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* BOUTON RETOUR */}
      {viewLevel !== 'WORLD' && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          <Text style={styles.backText}>
            {selectedZone ? 'Retour au pays' : 'Monde'}
          </Text>
        </TouchableOpacity>
      )}

      {/* LISTE DES VOYAGES (BOTTOM SHEET) */}
      {selectedZone && (
        <View style={styles.bottomSheet}>
          {/* Fond flou */}
          <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
          
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Voyages • {selectedZone.name}</Text>
            <TouchableOpacity onPress={() => setSelectedZone(null)}>
              <Ionicons name="close-circle" size={30} color="#ccc" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
            {selectedZone.trips.map((trip) => (
              <TouchableOpacity 
                key={trip.id} 
                style={styles.tripItem}
                // 👇 4. LE CLIC EST ICI
                onPress={() => goToDetails(trip, selectedZone.image)}
              >
                <Image source={{ uri: selectedZone.image }} style={styles.tripThumb} />
                
                <View style={{ flex: 1 }}>
                  <Text style={styles.tripTitle}>{trip.title}</Text>
                  <Text style={styles.tripSubtitle}>{trip.days} jours</Text>
                </View>

                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{trip.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {/* Espace vide pour ne pas être caché par la navbar */}
            <View style={{ height: 120 }} />
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: width, height: height },

  // PAYS
  countryMarker: {
    backgroundColor: '#fff',
    paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 25, borderWidth: 1, borderColor: '#eee',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 5,
  },
  countryText: { fontWeight: 'bold', fontSize: 14, color: '#1A1A1A' },

  // ZONES
  zoneMarker: { alignItems: 'center', justifyContent: 'center' },
  zoneMarkerSelected: { transform: [{ scale: 1.1 }] },
  zoneDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#00D668', borderWidth: 3, borderColor: '#fff',
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3,
  },
  zoneText: {
    marginTop: 4, backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    fontSize: 12, fontWeight: '600', color: '#333', overflow: 'hidden',
  },

  // UI ELEMENTS
  backButton: {
    position: 'absolute', top: 50, left: 20,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 30,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 5, elevation: 5, gap: 8,
  },
  backText: { fontWeight: 'bold', color: '#1A1A1A' },

  bottomSheet: {
    position: 'absolute', bottom: 0, width: '100%',
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    overflow: 'hidden', paddingTop: 20, paddingHorizontal: 20,
    paddingBottom: 0,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sheetTitle: { fontSize: 18, fontWeight: '900', color: '#1A1A1A' },

  tripItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)', // Un peu transparent pour l'effet glass
    padding: 12, borderRadius: 16, marginBottom: 12,
  },
  tripThumb: { width: 50, height: 50, borderRadius: 10, marginRight: 15, backgroundColor: '#eee' },
  tripTitle: { fontWeight: 'bold', fontSize: 15, color: '#1A1A1A' },
  tripSubtitle: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  priceTag: { backgroundColor: '#E8FAF0', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  priceText: { color: '#00D668', fontWeight: 'bold', fontSize: 13 },
});

export default MapScreen;