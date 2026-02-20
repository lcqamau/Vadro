import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: 'http://192.168.1.48:3000/api', // Mets ton IP locale ici
});

// L'INTERCEPTEUR : C'est lui qui ajoute le Token automatiquement
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;