import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('projects');
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const avatarUri = user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=00D668&color=fff`;

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        navigation.replace('Login');
        return;
      }

      const userRes = await apiClient.get('users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userRes.data);

      const tripsRes = await apiClient.get(`/users/${userRes.data.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(tripsRes.data.trips || []);
    } catch (error) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('userToken');
        navigation.replace('Login');
      } else {
        console.error("Erreur profil:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIQUE DE DÉCONNEXION AVEC POPUP ---
  const confirmLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Es-tu sûr de vouloir te déconnecter de Vadro ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Oui, déconnexion", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            navigation.replace('Login');
          } 
        }
      ]
    );
  };

  const renderGridItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem}>
      <Image 
        source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1476610182048-b716b8518aae' }} 
        style={styles.gridImage} 
      />
      <View style={styles.gridOverlay} />
      <View style={styles.cardContent}>
        <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.gridSubtitle}>{item.durationDays} j • {item.budgetEuro}€</Text>
      </View>
    </TouchableOpacity>
  );

  const pickImage = async () => {
    // 1. Demander la permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert("Désolé, nous avons besoin des permissions pour que ça fonctionne !");
      return;
    }

    // 2. Ouvrir la galerie
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      // 3. Ici, tu devras envoyer l'image à ton backend via Axios
      updateAvatarOnBackend(selectedImage);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#00D668" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={styles.topActions}>
          <TouchableOpacity 
            style={styles.settingsBtn} 
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* INFOS PROFIL */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <TouchableOpacity style={styles.editBadge}><Ionicons name="pencil" size={14} color="#fff" /></TouchableOpacity>
          </View>
          <Text style={styles.name}>{user?.username}</Text>
          <Text style={styles.handle}>@{user?.username?.toLowerCase()}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{trips.length}</Text>
              <Text style={styles.statLabel}>Projets</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.trustScore || 100}</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsWrapper}>
            <TouchableOpacity style={[styles.tab, activeTab === 'projects' && styles.activeTab]} onPress={() => setActiveTab('projects')}>
              <Text style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>Projets</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'memories' && styles.activeTab]} onPress={() => setActiveTab('memories')}>
              <Text style={[styles.tabText, activeTab === 'memories' && styles.activeTabText]}>Souvenirs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LISTE OU VIDE */}
        <FlatList
          data={activeTab === 'projects' ? trips : []}
          renderItem={renderGridItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          ListFooterComponent={
            <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
              <Ionicons name="power" size={16} color="#FF3B30" />
              <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>
          }
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topActions: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  profileHeader: { alignItems: 'center', paddingHorizontal: 30 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#F2F2F7' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#00D668', width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  handle: { fontSize: 14, color: '#00D668', fontWeight: '600', marginBottom: 15 },
  statsContainer: { flexDirection: 'row', backgroundColor: '#F2F2F7', borderRadius: 15, padding: 15, width: '100%' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#8E8E93' },
  statDivider: { width: 1, backgroundColor: '#E5E5EA' },
  tabsContainer: { paddingHorizontal: 20, marginVertical: 20 },
  tabsWrapper: { flexDirection: 'row', backgroundColor: '#F2F2F7', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#fff' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#999' },
  activeTabText: { color: '#1A1A1A' },
  gridContainer: { paddingHorizontal: 10, paddingBottom: 40 },
  gridItem: { flex: 1, margin: 5, height: 180, borderRadius: 15, overflow: 'hidden' },
  gridImage: { width: '100%', height: '100%' },
  gridOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  cardContent: { position: 'absolute', bottom: 10, left: 10 },
  gridTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  gridSubtitle: { color: '#fff', fontSize: 10, opacity: 0.8 },
  
  // LE BOUTON ROUGE
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 30, 
    marginBottom: 20,
    alignSelf: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF3B3015'
  },
  logoutText: { color: '#FF3B30', fontSize: 13, fontWeight: '700', marginLeft: 6 }
});

export default ProfileScreen;