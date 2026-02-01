// src/navigation/AppNavigator.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import de tes écrans
import TabNavigator from './TabNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import TripDetailsScreen from '../screens/DetailsScreen';
import CreateTripScreen from '../screens/CreateTripScreen';
import GeneratedTripScreen from '../screens/GeneratedTripScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // Vérifie si un jeton de connexion existe déjà
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } catch (e) {
        console.error("Erreur lecture token", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  // Écran de chargement pendant la vérification du jeton
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator size="large" color="#00D668" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        // Si un jeton est présent, on commence sur Main, sinon Onboarding
        initialRouteName={userToken ? "Main" : "Onboarding"}
        screenOptions={{ headerShown: false }}
      >

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

        {/* 5. Écran de Résultat Généré */}
        <Stack.Screen 
          name="GeneratedTrip" 
          component={GeneratedTripScreen} 
          options={{ 
            presentation: 'card', 
            gestureEnabled: false 
          }} 
        />
        
         {/* 6. Écran de Paramètres */}
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ 
            presentation: 'card',
            gestureEnabled: true 
          }} 
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;