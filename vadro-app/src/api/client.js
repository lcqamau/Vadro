import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
  baseURL: 'http://192.168.1.48:3000/api', // Mets ton IP locale ici
});

// L'INTERCEPTEUR : C'est lui qui ajoute le Token automatiquement
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;