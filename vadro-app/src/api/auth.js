import apiClient from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const register = async (username, email, password) => {
  try {
    // Appelle la route de ton controller
    const response = await apiClient.post('/users/register', { username, email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Erreur d'inscription";
  }
};

export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/users/login', { email, password });
    if (response.data.token) {
      // On stocke le badge d'accès pour les prochaines requêtes
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Identifiants incorrects";
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userData');
};