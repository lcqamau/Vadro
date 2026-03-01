const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

// Security middlewares
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // To allow loading images from /uploads

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  message: { message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.' }
});
app.use('/api', apiLimiter);

// CORS — autorise l'app web Expo et les apps mobiles
app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://localhost:19006',
    'http://127.0.0.1:8081',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

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

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Une erreur interne est survenue',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});