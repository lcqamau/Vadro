const express = require('express');
const app = express();
const tripRoutes = require('./src/routes/tripRoutes'); // Import des routes

app.use(express.json());

// --- ROUTES ---
// Toutes les routes qui commencent par /trips iront dans tripRoutes
app.use('/trips', tripRoutes);

// Route de test simple
app.get('/', (req, res) => {
  res.send('API Vadro est en ligne ! 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});