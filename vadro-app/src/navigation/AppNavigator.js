// src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import TabNavigator from './TabNavigator';
import TripDetailsScreen from '../screens/DetailsScreen'; // <--- IMPORT

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* La Navbar principale */}
        <Stack.Screen name="Main" component={TabNavigator} />
        
        {/* L'écran de détail (s'ouvrira PAR DESSUS la navbar) */}
        <Stack.Screen 
          name="TripDetails" 
          component={TripDetailsScreen} 
          options={{ presentation: 'modal' }} // Effet sympa d'ouverture
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;