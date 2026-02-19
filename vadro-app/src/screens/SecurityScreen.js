import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';

const SecurityScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      // Endpoint factice à implémenter
      await client.post('/users/change-password', { currentPassword, newPassword });
      Alert.alert("Succès", "Mot de passe modifié !");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Erreur", "Impossible de changer le mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sécurité</Text>
            <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Changer de mot de passe</Text>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe actuel</Text>
                <TextInput 
                    style={styles.input} 
                    secureTextEntry 
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                />
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nouveau mot de passe</Text>
                <TextInput 
                    style={styles.input} 
                    secureTextEntry 
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmer nouveau mot de passe</Text>
                <TextInput 
                    style={styles.input} 
                    secureTextEntry 
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
            </View>

            <TouchableOpacity 
                style={[styles.btn, loading && { opacity: 0.7 }]} 
                onPress={handleChangePassword}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Mettre à jour</Text>}
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Authentification à deux facteurs</Text>
            <View style={styles.infoBox}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#00D668" />
                <Text style={styles.infoText}>Protégez votre compte avec la 2FA (Bientôt disponible).</Text>
            </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 13, color: '#666', marginBottom: 15, marginTop: 20, textTransform: 'uppercase', marginLeft: 5 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 14, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#E5E5EA' },
  btn: { backgroundColor: '#00D668', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, gap: 12 },
  infoText: { flex: 1, color: '#666', fontSize: 14 }
});

export default SecurityScreen;
