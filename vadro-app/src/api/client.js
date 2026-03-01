import axios from 'axios';
import { API_ip } from '@env';
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
  baseURL: API_ip,
});

// L'INTERCEPTEUR : C'est lui qui ajoute le Token automatiquement
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;