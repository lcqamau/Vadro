const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const uploadRoutes = require('./src/routes/uploadRoutes');
const tripRoutes = require('./src/routes/tripRoutes'); // Import des routes
const userRoutes = require('./src/routes/userRoutes');
const { stepRouter } = require('./src/routes/stepRoutes');
const { reviewRouter } = require('./src/routes/reviewRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');

dotenv.config();

const app = express();

app.use(express.json());

// --- ROUTES ---
// Toutes les routes qui commencent par /trips iront dans tripRoutes
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);
app.use('/api/steps', stepRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


// Route de test simple
app.get('/', (req, res) => {
  res.send('API Vadro est en ligne ! 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});