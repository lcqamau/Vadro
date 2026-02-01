import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  
  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Oui", 
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          navigation.replace('Login'); // Redirige vers le Login
        } 
      }
    ]);
  };

  const SettingItem = ({ icon, title, onPress, color = "#1A1A1A" }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={22} color={color} />
        <Text style={[styles.itemText, { color }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <SettingItem icon="person-outline" title="Informations personnelles" onPress={() => {}} />
        <SettingItem icon="lock-closed-outline" title="Sécurité et mot de passe" onPress={() => {}} />
        <SettingItem icon="notifications-outline" title="Notifications" onPress={() => {}} />
        
        <Text style={styles.sectionTitle}>Vadro Pro</Text>
        <SettingItem icon="briefcase-outline" title="Mes investissements" onPress={() => {}} />

        <Text style={styles.sectionTitle}>Plus</Text>
        <SettingItem icon="help-circle-outline" title="Aide & Support" onPress={() => {}} />
        <SettingItem icon="log-out-outline" title="Déconnexion" onPress={handleLogout} color="#FF3B30" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', marginBottom: 10, marginTop: 20 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemText: { fontSize: 16, fontWeight: '500' }
});

export default SettingsScreen;