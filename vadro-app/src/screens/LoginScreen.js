// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../api/client';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Champs manquants", "Merci de saisir ton email et ton mot de passe.");
    }

    setLoading(true);
    try {
      // Appel vers ton contrôleur loginUser
      const response = await apiClient.post('/users/login', {
        email: email,
        password: password
      });

      if (response.data.token) {
        // On stocke le token pour authMiddleware.js
        await SecureStore.setItemAsync('userToken', response.data.token);
        navigation.replace('Main');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Identifiants invalides.";
      Alert.alert("Échec de connexion", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.content}>
        
        {/* EN-TÊTE */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>Bon retour ! 👋</Text>
          <Text style={styles.subtitle}>Connecte-toi pour retrouver tes voyages.</Text>
        </View>

        {/* FORMULAIRE */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.form}
        >
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
              secureTextEntry={secureText}
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <Ionicons name={secureText ? "eye-off-outline" : "eye-outline"} size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {/* Bouton Connexion */}
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <Text style={styles.loginText}>Connexion en cours...</Text>
            ) : (
              <Text style={styles.loginText}>Se connecter</Text>
            )}
          </TouchableOpacity>

        </KeyboardAvoidingView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLink}> S'inscrire</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { flex: 1, padding: 25 },
  
  header: { marginTop: 20, marginBottom: 40 },
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

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 30 },
  forgotText: { color: '#00D668', fontWeight: '600' },

  loginBtn: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  loginText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  footerText: { color: '#8E8E93', fontSize: 15 },
  signupLink: { color: '#00D668', fontWeight: 'bold', fontSize: 15 },
});

export default LoginScreen;