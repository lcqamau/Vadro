// src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Import de tes écrans
import TabNavigator from './TabNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import TripDetailsScreen from '../screens/DetailsScreen';
import CreateTripScreen from '../screens/CreateTripScreen';
import GeneratedTripScreen from '../screens/GeneratedTripScreen';

// 👇 C'est cette ligne qui manquait peut-être :
const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* 1. Écran de Démarrage */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />

        {/* 2. L'application principale (Navbar) */}
        <Stack.Screen name="Main" component={TabNavigator} />

        {/* Flux d'Auth */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
              
        {/* 3. Écran de détail (Modal) */}
        <Stack.Screen 
          name="TripDetails" 
          component={TripDetailsScreen} 
          options={{ presentation: 'modal' }} 
        />

        {/* 4. Écran de Création (Modal) */}
        <Stack.Screen 
          name="CreateTrip" 
          component={CreateTripScreen} 
          options={{ 
            presentation: 'modal',
            gestureEnabled: true,
          }} 
        />

        {/* 5. Écran de Résultat Généré (Carte classique) */}
        <Stack.Screen 
          name="GeneratedTrip" 
          component={GeneratedTripScreen} 
          options={{ 
            presentation: 'card', 
            gestureEnabled: false // Empêche le retour accidentel
          }} 
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;