// src/navigation/TabNavigator.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, LayoutAnimation, UIManager } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Import des écrans
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import CreateTripScreen from '../screens/CreateTripScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

const { width } = Dimensions.get('window');

// Activation de l'animation pour Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  // 1. On sépare les routes en 3 catégories
  const leftRoutes = state.routes.filter(r => r.name === 'Home' || r.name === 'Map');
  const rightRoutes = state.routes.filter(r => r.name === 'Favorites' || r.name === 'Profile');
  const createRoute = state.routes.find(r => r.name === 'Create');

  // Fonction générique pour rendre un bouton de navigation
  const renderNavButton = (route) => {
    const realIndex = state.routes.findIndex(r => r.key === route.key);
    const { options } = descriptors[route.key];
    const isFocused = state.index === realIndex;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        navigation.navigate(route.name);
      }
    };

    let iconName;
    let label;

    if (route.name === 'Home') {
      iconName = isFocused ? 'compass' : 'compass-outline';
      label = 'Home';
    } else if (route.name === 'Map') {
      iconName = isFocused ? 'map' : 'map-outline';
      label = 'Map';
    } else if (route.name === 'Favorites') {
      iconName = isFocused ? 'heart' : 'heart-outline';
      label = 'Likes';
    } else if (route.name === 'Profile') {
      iconName = isFocused ? 'person' : 'person-outline';
      label = 'Profil';
    }

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={[
          styles.tabButton,
          isFocused ? styles.tabButtonFocused : styles.tabButtonNormal
        ]}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={iconName} 
          size={24} 
          color={isFocused ? "#000" : "#FFF"} 
        />
        {isFocused && (
          <Text style={styles.tabLabel} numberOfLines={1}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tabBarContainer}>
      
      {/* FOND FLOU */}
      <View style={styles.blurContainer}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.darkOverlay} />
      </View>

      {/* CONTENU DE LA BARRE */}
      <View style={styles.contentRow}>
        
        {/* GROUPE GAUCHE (Explore, Map) */}
        <View style={styles.sideGroup}>
          {leftRoutes.map(renderNavButton)}
        </View>

        {/* ESPACE VIDE AU MILIEU (Pour laisser la place au bouton +) */}
        <View style={styles.centerSpacer} />

        {/* GROUPE DROITE (Favorites, Profile) */}
        <View style={styles.sideGroup}>
          {rightRoutes.map(renderNavButton)}
        </View>

      </View>

      {/* LE BOUTON CRÉER (+) - POSITION ABSOLUE */}
      {/* Il est hors du flux, donc il ne bougera jamais */}
     <View style={styles.absoluteCenterContainer} pointerEvents="box-none">
        <TouchableOpacity
          // 👇 C'EST ICI QU'ON CHANGE LA DESTINATION
          onPress={() => navigation.navigate('CreateTrip')} 
          style={styles.centerButton}
          activeOpacity={0.9}
        >
          <View style={styles.centerButtonCircle}>
             <Ionicons name="add" size={38} color="#FFF" />
          </View>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* L'ordre ici n'a plus d'importance visuelle car on trie manuellement */}
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Create" component={CreateTripScreen} /> 
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  // CONTENEUR GLOBAL
  tabBarContainer: {
    position: 'absolute',
    bottom: 30, 
    left: 10,
    right: 10,
    height: 65, 
    elevation: 0,
  },
  
  // FOND FLOU
  blurContainer: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 30, 30, 0.4)',
  },

  // LA LIGNE DE CONTENU
  contentRow: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    paddingHorizontal: 5,
  },

  // GROUPES LATÉRAUX
  sideGroup: {
    flex: 1, // Prend toute la place disponible de son côté
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly', // Répartit les boutons
  },

  // ESPACEUR CENTRAL (Invisible)
  centerSpacer: {
    width: 70, // Largeur réservée pour le bouton +
  },

  // --- LE BOUTON CENTRAL ABSOLU ---
  absoluteCenterContainer: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    alignItems: 'center', // Centre horizontalement
    justifyContent: 'center', // Centre verticalement par rapport à la barre
    zIndex: 10,
  },
  centerButton: {
    top: -25, // On le remonte pour qu'il flotte
  },
  centerButtonCircle: {
    width: 65, 
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#00D668', 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#00D668",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FAFAFA', 
  },

  // --- BOUTONS NAVIGATION ---
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 30,
  },
  tabButtonNormal: {
    width: 50,
    backgroundColor: 'transparent', 
  },
  tabButtonFocused: {
    flex: 1, // S'agrandit pour prendre la place DISPONIBLE DANS SON GROUPE
    paddingHorizontal: 15,
    backgroundColor: '#00D668', 
    marginHorizontal: 5,
  },
  tabLabel: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 13,
  },
});

export default TabNavigator;