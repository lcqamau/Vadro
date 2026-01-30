// src/screens/OnboardingScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Animated } from 'react-native';
// 👇 ON IMPORTE LA NOUVELLE LIBRAIRIE
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// URL de la vidéo
const VIDEO_SOURCE = require('../../assets/video/Van.mp4');

const OnboardingScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 👇 1. ON CONFIGURE LE PLAYER AVEC LE HOOK
  const player = useVideoPlayer(VIDEO_SOURCE, player => {
    player.loop = true;   // Boucler
    player.play();        // Jouer tout de suite
    player.muted = true;  // Couper le son
  });

  useEffect(() => {
    // Animation d'apparition du texte
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 👇 2. LE NOUVEAU COMPOSANT D'AFFICHAGE */}
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"      // Remplace resizeMode="cover"
        nativeControls={false}  // Cache les contrôles natifs (play/pause, barre de temps...)
      />

      {/* LE RESTE NE CHANGE PAS (OVERLAY + CONTENU) */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.contentContainer}>
        
        {/* LOGO */}
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', marginTop: 60 }}>
          <View style={styles.iconCircle}>
             <Ionicons name="earth" size={50} color="#00D668" />
          </View>
          <Text style={styles.logoText}>VADRO</Text>
          <Text style={styles.tagline}>Explorez le monde, sans limite.</Text>
        </Animated.View>

        {/* BOUTON D'ACTION */}
        <Animated.View style={{ opacity: fadeAnim, width: '100%', paddingHorizontal: 20, paddingBottom: 40 }}>
          <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Signup')} // Changé de 'Main' à 'Signup'
          >
            <Text style={styles.buttonText}>C'est parti !</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
          
          {/* LIEN SECONDAIRE -> CONNEXION */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>Déjà un compte ? Connexion</Text>
          </TouchableOpacity>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  
  video: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0, right: 0,
    width: width,
    height: height,
  },
  
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)', 
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'space-between', 
    alignItems: 'center',
  },

  // LOGO
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
    fontWeight: '500',
  },

  // BOUTON
  button: {
    backgroundColor: '#00D668',
    height: 65,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: "#00D668",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
  }
});

export default OnboardingScreen;