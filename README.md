# 🌍 Vadro — L'App de Voyage Nouvelle Génération

![Vadro Banner](https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80)
> *Note: Remplace l'URL ci-dessus par une vraie bannière ou un mockup de ton application.*

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**Vadro** est une application mobile B2B2C conçue pour les voyageurs, les créateurs de contenu et les hôtes Airbnb. Elle permet de créer, partager et **"remixer"** des itinéraires de voyage jour par jour, tout en intégrant un système de réservation intelligent via affiliation.

---

## ✨ Concept & Vision

La plupart des applications de voyage se contentent de lister des lieux. Vadro va plus loin :
1. **Inspiration structurée :** Les voyages sont découpés jour par jour avec des étapes précises (Dormir, Manger, Activité, Spot).
2. **La fonction "Remix" 🪄 :** Un utilisateur trouve un voyage parfait, mais veut changer l'hôtel du Jour 2 ? Il le "Remixe". Le voyage est cloné dans son espace personnel, prêt à être modifié et adapté à ses dates.
3. **Le business model (Cheval de Troie Airbnb) :** Les hôtes Airbnb utilisent Vadro pour créer leur "Guide d'accueil interactif". Les voyageurs scannent un QR code, récupèrent l'itinéraire local, le remixent, et réservent leurs activités via les liens d'affiliation de Vadro.

---

## 🚀 Fonctionnalités Clés

* 🗺️ **Itinéraires Jour par Jour :** Cartes interactives et timeline de voyage détaillée.
* 🪄 **Moteur de Remix :** Clonage d'itinéraires complets en un clic pour se les approprier.
* ❤️ **Système Social :** Favoris synchronisés avec *Optimistic UI* et retours haptiques (façon Instagram).
* 🔗 **Smart Booking (Générateur de liens) :** Transformation des étapes (GPS + Dates) en liens d'affiliation ciblés (Booking.com, Viator, etc.).
* 🛡️ **Système de TrustScore :** Évaluation de la fiabilité des créateurs de voyages.

---

## 🛠️ Stack Technique

### Frontend (Mobile)
* **Framework :** React Native avec Expo
* **Navigation :** React Navigation (Stack & Tabs)
* **UI/UX :** Expo Blur, Linear Gradient, Ionicons, Haptics
* **Requêtes API :** Axios avec Intercepteurs JWT

### Backend (API REST)
* **Serveur :** Node.js & Express.js
* **Base de données :** PostgreSQL
* **ORM :** Prisma
* **Sécurité :** Authentification JWT (JSON Web Tokens), Bcrypt (hachage des mots de passe)

---

## 📱 Captures d'écran

| Accueil (Explorer) | Détails du Voyage | Itinéraire & Carte |
| :---: | :---: | :---: |
| <img src="https://via.placeholder.com/250x500.png?text=Home+Screen" width="250"/> | <img src="https://via.placeholder.com/250x500.png?text=Trip+Details" width="250"/> | <img src="https://via.placeholder.com/250x500.png?text=Map+%26+Timeline" width="250"/> |

> *Ajoutez les vrais screenshots de l'application ici pour plus d'impact.*

---

## ⚙️ Installation & Lancement

### Pré-requis
* [Node.js](https://nodejs.org/) (v16+)
* [PostgreSQL](https://www.postgresql.org/) installé et en cours d'exécution
* Application [Expo Go](https://expo.dev/client) sur iOS ou Android (ou un émulateur)

### 1. Cloner le projet
```bash
git clone [https://github.com/ton-username/vadro.git](https://github.com/ton-username/vadro.git)
cd vadro

### 2. Backend (API)
```bash
cd vadro-backend
npm install
npm run dev
```

### 3. Frontend (Mobile)
```bash
cd vadro-app
npm install
npx expo start
```

---

## 🤝 Contribution

Nous sommes ouverts aux contributions ! Que ce soit pour corriger un bug, améliorer l'interface ou ajouter une nouvelle fonctionnalité, n'hésitez pas :
1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commentez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.