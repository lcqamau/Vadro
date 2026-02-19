import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, StatusBar, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
// 👇 1. IMPORT TRÈS IMPORTANT POUR LA NAVIGATION
import { useNavigation } from '@react-navigation/native';
import client from '../api/client';

const { width, height } = Dimensions.get('window');

// Style "Clean & Modern" (Inspiré d'applications comme Airbnb/Uber)
const MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c9c9c9" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  }
];

const MapScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Charger les voyages depuis l'API en fonction de la région
  const fetchTripsInRegion = async (region) => {
    if (!region) return;
    
    // Calcul des bornes (bounding box)
    const minLat = region.latitude - region.latitudeDelta / 2;
    const maxLat = region.latitude + region.latitudeDelta / 2;
    const minLng = region.longitude - region.longitudeDelta / 2;
    const maxLng = region.longitude + region.longitudeDelta / 2;

    try {
      setLoading(true);
      const res = await client.get('/trips', {
        params: { minLat, maxLat, minLng, maxLng }
      });
      
      const validTrips = res.data.filter(t => 
        t.steps && t.steps.length > 0 && 
        t.steps[0].latitude && t.steps[0].longitude
      );
      
      // On remplace les trips visibles
      setTrips(validTrips);
    } catch (error) {
      console.error("Erreur chargement map zone:", error);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial (France par défaut)
  useEffect(() => {
     // On lance une première recherche sur la zone par défaut
     fetchTripsInRegion({
        latitude: 46, longitude: 2, latitudeDelta: 10, longitudeDelta: 10
     });
  }, []);

  const onRegionChangeComplete = (region) => {
      // On recharge les données quand l'utilisateur a fini de bouger la carte
      fetchTripsInRegion(region);
  };

  const handleMarkerPress = async (trip) => {
    setSelectedTrip(trip);
    setRouteCoordinates([]); 

    // Fetch full trip details
    try {
        const res = await client.get(`/trips/${trip.id}`);
        const steps = res.data.steps || [];
        if (steps.length > 0) {
             const coords = steps
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map(s => ({
                    latitude: s.latitude,
                    longitude: s.longitude
                }))
                .filter(c => c.latitude && c.longitude);
            setRouteCoordinates(coords);
        }
    } catch (error) {
        console.error("Error fetching trip details for map:", error);
    }

    // Centrer la carte sur le marker
    mapRef.current.animateToRegion({
        latitude: trip.steps[0].latitude,
        longitude: trip.steps[0].longitude,
        latitudeDelta: 1,
        longitudeDelta: 1,
    }, 500);
  };

  const goToDetails = (trip) => {
    navigation.navigate('TripDetails', { trip });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={MAP_STYLE}
        initialRegion={{
          latitude: 46, longitude: 2, latitudeDelta: 10, longitudeDelta: 10
        }}
        onRegionChangeComplete={onRegionChangeComplete}
        onPress={() => setSelectedTrip(null)}
      >
        {routeCoordinates.length > 1 && (
            <Polyline
                coordinates={routeCoordinates}
                strokeColor="#00D668"
                strokeWidth={4}
            />
        )}

        {trips.map((trip) => {
          const isSelected = selectedTrip?.id === trip.id;
          return (
            <Marker
                key={trip.id}
                coordinate={{ 
                    latitude: trip.steps[0].latitude, 
                    longitude: trip.steps[0].longitude 
                }}
                onPress={(e) => {
                    e.stopPropagation();
                    handleMarkerPress(trip);
                }}
                tracksViewChanges={false}
                zIndex={isSelected ? 999 : 1}
            >
                <View style={[styles.markerContainer, isSelected && styles.markerSelected]}>
                    <View style={styles.markerImageWrapper}>
                        <Image source={{ uri: trip.imageUrl }} style={styles.markerImage} />
                    </View>
                    <View style={styles.markerBadge}>
                        <Text style={styles.markerText}>{trip.budgetEuro}€</Text>
                    </View>
                    {/* Petit triangle pointeur */}
                    <View style={styles.markerPointer} />
                </View>
            </Marker>
          );
        })}
      </MapView>

      {/* BOUTON GEOLOCALISATION */}
       <TouchableOpacity 
          style={styles.geoBtn} 
          onPress={async () => {
              let { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                  alert("Permission refusée");
                  return;
              }
              let location = await Location.getCurrentPositionAsync({});
              mapRef.current.animateToRegion({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.1, // Zoom assez proche
                  longitudeDelta: 0.1,
              }, 1000);
          }}
       >
          <Ionicons name="locate" size={24} color="#1A1A1A" />
       </TouchableOpacity>

      {/* HEADER FLOTTANT (Recherche) */}
      <BlurView intensity={80} tint="light" style={styles.searchHeader}>
         <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
             <Ionicons name="search" size={20} color="#1A1A1A" />
             <Text style={styles.searchPlaceholder}>Où allez-vous ?</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.filterBtn}>
             <Ionicons name="options" size={20} color="#1A1A1A" />
         </TouchableOpacity>
      </BlurView>
      
      {loading && (
          <View style={styles.loadingPill}>
              <ActivityIndicator size="small" color="#00D668" />
              <Text style={styles.loadingText}>Recherche...</Text>
          </View>
      )}

      {/* BOTTOM SHEET DÉTAIL VOYAGE (Nouvelle version) */}
      {selectedTrip && (
        <View style={styles.bottomCardContainer}>
            <TouchableOpacity 
                style={styles.bottomCard}
                activeOpacity={0.95}
                onPress={() => goToDetails(selectedTrip)}
            >
                {/* Image Header */}
                <View style={styles.cardImageContainer}>
                    <Image source={{ uri: selectedTrip.imageUrl }} style={styles.cardImage} />
                    <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
                        style={styles.cardGradient}
                    />
                    <TouchableOpacity 
                        style={styles.closeBtn}
                        onPress={() => setSelectedTrip(null)}
                    >
                        <Ionicons name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                    
                    <View style={styles.cardImageOverlay}>
                        <View style={styles.cardTag}>
                            <Text style={styles.cardTagText}>{selectedTrip.tags?.[0] || 'VOYAGE'}</Text>
                        </View>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{selectedTrip.title}</Text>
                        <View style={styles.cardRating}>
                            <Ionicons name="star" size={14} color="#FFE500" />
                            <Text style={styles.cardRatingText}>{selectedTrip.rating || "4.8"}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.cardFooterRow}>
                        <View style={styles.cardMeta}>
                             <Ionicons name="time-outline" size={16} color="#8E8E93" />
                             <Text style={styles.cardMetaText}>{selectedTrip.durationDays} jours</Text>
                        </View>
                        <View style={styles.cardPriceBox}>
                             <Text style={styles.cardPriceLabel}>dès </Text>
                             <Text style={styles.cardPrice}>{selectedTrip.budgetEuro}€</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: width, height: height },

  // NOUVEAUX MARKERS (Bulles Images)
  markerContainer: { alignItems: 'center', justifyContent: 'center' },
  markerSelected: { transform: [{ scale: 1.15 }], zIndex: 999 },
  
  markerImageWrapper: {
      width: 50, height: 50, borderRadius: 25,
      borderWidth: 2, borderColor: '#fff',
      backgroundColor: '#f0f0f0',
      overflow: 'hidden',
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, elevation: 4
  },
  markerImage: { width: '100%', height: '100%' },
  
  markerBadge: {
      position: 'absolute', bottom: -5,
      backgroundColor: '#1A1A1A', paddingHorizontal: 6, paddingVertical: 2,
      borderRadius: 10, borderWidth: 1, borderColor: '#fff',
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, elevation: 3
  },
  markerText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  markerPointer: {
      width: 0, height: 0, marginTop: 4,
      borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 6,
      borderStyle: 'solid', backgroundColor: 'transparent',
      borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: 'rgba(0,0,0,0.2)',
      // C'est juste une petite ombre optionnelle sous la bulle
      opacity: 0
  },

  // HEADER RECHERCHE
  searchHeader: {
      position: 'absolute', top: 50, left: 20, right: 20,
      flexDirection: 'row', alignItems: 'center', gap: 10,
      padding: 10, borderRadius: 30, overflow: 'hidden'
  },
  searchBar: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      backgroundColor: '#fff', borderRadius: 25,
      paddingHorizontal: 15, paddingVertical: 12,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2
  },
  searchPlaceholder: { marginLeft: 10, color: '#8E8E93', fontWeight: '500' },
  filterBtn: {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2
  },
  
  geoBtn: {
      position: 'absolute', top: 110, right: 20, 
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 4
  },

  // LOADING
  loadingPill: {
      position: 'absolute', top: 120, alignSelf: 'center',
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 4
  },
  loadingText: { fontSize: 12, fontWeight: '600', color: '#1A1A1A' },

  // BOTTOM CARD (NOUVEAU DESIGN PREMIUM)
  bottomCardContainer: {
      position: 'absolute', bottom: 130, left: 20, right: 20,
      shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  bottomCard: {
      backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden',
  },
  cardImageContainer: { height: 160, width: '100%', position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  
  closeBtn: {
      position: 'absolute', top: 10, right: 10,
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'
  },
  
  cardImageOverlay: { position: 'absolute', top: 10, left: 10 },
  cardTag: { 
      backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, 
      borderRadius: 8,
  },
  cardTagText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: '#1A1A1A' },
  
  cardContent: { padding: 16 },
  
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', flex: 1, marginRight: 10 },
  cardRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardRatingText: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardMetaText: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  
  cardPriceBox: { flexDirection: 'row', alignItems: 'baseline' },
  cardPriceLabel: { fontSize: 12, color: '#8E8E93', marginRight: 2 },
  cardPrice: { fontSize: 18, fontWeight: '900', color: '#00D668' },
});

export default MapScreen;