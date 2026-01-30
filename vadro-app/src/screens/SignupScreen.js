// src/screens/SignupScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Après inscription, on va directement à l'accueil (ou vers un onboarding profile)
      navigation.replace('Main');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.content}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>Créer un compte 🚀</Text>
          <Text style={styles.subtitle}>Rejoins l'aventure VADRO dès maintenant.</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.form}>
          
          {/* Nom */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#8E8E93" style={styles.icon} />
            <TextInput
              placeholder="Ton prénom"
              placeholderTextColor="#8E8E93"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#8E8E93" style={styles.icon} />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#8E8E93"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Mot de passe */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.icon} />
            <TextInput
              placeholder="Mot de passe"
              placeholderTextColor="#8E8E93"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Bouton Inscription */}
          <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={loading}>
             <Text style={styles.signupText}>{loading ? "Création..." : "S'inscrire"}</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            En t'inscrivant, tu acceptes nos <Text style={styles.link}>Conditions Générales</Text> et notre <Text style={styles.link}>Politique de Confidentialité</Text>.
          </Text>

        </KeyboardAvoidingView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}> Se connecter</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { flex: 1, padding: 25 },
  
  header: { marginTop: 20, marginBottom: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '900', color: '#1A1A1A', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#8E8E93', lineHeight: 24 },

  form: { flex: 1 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E5EA',
    borderRadius: 16,
    paddingHorizontal: 15, paddingVertical: 14,
    marginBottom: 15,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1A1A1A' },

  signupBtn: {
    backgroundColor: '#00D668', // Vert Virote
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#00D668", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
  },
  signupText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  termsText: { marginTop: 20, fontSize: 12, color: '#8E8E93', textAlign: 'center', lineHeight: 18 },
  link: { color: '#1A1A1A', fontWeight: '600' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  footerText: { color: '#8E8E93', fontSize: 15 },
  loginLink: { color: '#00D668', fontWeight: 'bold', fontSize: 15 },
});

export default SignupScreen;