// src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// On importe notre nouvelle Navbar
import TabNavigator from './TabNavigator';

// On garde MapScreen ici aussi si on veut pouvoir l'ouvrir en plein écran sans la navbar parfois
import MapScreen from '../screens/MapScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* L'écran principal est maintenant la Navbar */}
        <Stack.Screen name="Main" component={TabNavigator} />
        
        {/* On peut ajouter d'autres écrans qui s'ouvriront par dessus la navbar */}
        <Stack.Screen name="MapScreenFull" component={MapScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;