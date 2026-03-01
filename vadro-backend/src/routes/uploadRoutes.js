const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configuration de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads/'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif/;
  const allowedMimetypes = /image\/jpeg|image\/jpg|image\/png|image\/webp|image\/gif/;

  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Erreur: Le fichier doit être une image valide (.jpg, .png, .webp, .gif)'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
});

// Route POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }
    
    // Génère l'URL accessible publiquement (assurez-vous de servir le dossier public/uploads)
    // On suppose que le serveur sert 'public/uploads' à la racine ou sur un chemin spécifique
    // Pour l'instant, on retourne le chemin relatif
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({ 
      message: 'Image uploadée avec succès',
      imageUrl: imageUrl 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
