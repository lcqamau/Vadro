import axios from 'axios';

// ⚠️ Vérifie qu'il n'y a pas d'espace à la fin de l'IP
const SERVER_IP = '192.168.1.48'; // Remets ton IP ici

const client = axios.create({
  baseURL: `http://${SERVER_IP}:3000`,
  timeout: 5000,
});

// AJOUTE CECI : Le mouchard qui va afficher l'URL dans ton terminal
client.interceptors.request.use((request) => {
  console.log('>>> REQUÊTE ENVOYÉE VERS :', request.baseURL + request.url);
  return request;
});

export default client;