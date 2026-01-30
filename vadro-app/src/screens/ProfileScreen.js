import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// --- DONNÉES SIMULÉES ---
const USER = {
  name: 'Amaury',
  handle: '@amaury_travels',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
  stats: {
    countries: 12,
    trips: 42,
    km: '15k'
  }
};

// ONGLET 1 : TES CRÉATIONS (L'IA ou toi)
const MY_PROJECTS = [
  { id: 1, title: 'Roadtrip Islande', image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae', status: 'Bientôt', date: 'Juin 2026' },
  { id: 2, title: 'Japon Express', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e', status: 'Brouillon', date: '---' },
  { id: 3, title: 'Week-end Rome', image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9', status: 'Généré', date: 'Oct 2026' },
];

// ONGLET 2 : TES SOUVENIRS (Voyages terminés / Bookés)
const MY_MEMORIES = [
  { id: 4, title: 'Surf Maroc', image: 'https://images.unsplash.com/photo-1531862112447-074472c57f29', status: 'Terminé', date: 'Jan 2024' },
  { id: 5, title: 'Safari Kenya', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801', status: 'Terminé', date: 'Nov 2023' },
  { id: 6, title: 'Nouvel An NY', image: 'https://images.unsplash.com/photo-1496442226666-8d4a0e2907eb', status: 'Terminé', date: 'Dec 2022' },
  { id: 7, title: 'Trek Pérou', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377', status: 'Terminé', date: 'Août 2022' },
];

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'memories'

  const openTrip = (trip) => {
    navigation.navigate('TripDetails', { 
      trip: { ...trip, price: '---', days: '?', title: trip.title } 
    });
  };

  const renderGridItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => openTrip(item)}>
      <Image source={{ uri: item.image }} style={styles.gridImage} />
      <View style={styles.gridOverlay} />
      
      {/* Titre et Date */}
      <View style={styles.cardContent}>
        <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.gridDate}>{item.date}</Text>
      </View>

      {/* Badge de statut (seulement pour les projets en cours) */}
      {activeTab === 'projects' && item.status && (
        <View style={[
          styles.statusBadge, 
          item.status === 'Brouillon' ? { backgroundColor: '#FFD700' } : { backgroundColor: '#00D668' }
        ]}>
          <Text style={[
            styles.statusText, 
            item.status === 'Brouillon' ? { color: '#000' } : { color: '#fff' }
          ]}>{item.status}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <SafeAreaView edges={['top']} style={{flex: 1}}>
        
        {/* HEADER PROFIL (Inchangé, car c'est top) */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: USER.avatar }} style={styles.avatar} />
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </View>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{USER.name}</Text>
            <Text style={styles.userHandle}>{USER.handle}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{USER.stats.countries}</Text>
                <Text style={styles.statLabel}>Pays</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{USER.stats.trips}</Text>
                <Text style={styles.statLabel}>Voyages</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{USER.stats.km}</Text>
                <Text style={styles.statLabel}>Km</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* --- NOUVEAUX ONGLETS --- */}
        <View style={styles.tabsContainer}>
          {/* Onglet 1 : PROJETS */}
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'projects' && styles.activeTab]} 
            onPress={() => setActiveTab('projects')}
          >
            <Ionicons name="rocket-outline" size={20} color={activeTab === 'projects' ? '#1A1A1A' : '#999'} />
            <Text style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>Mes Projets</Text>
          </TouchableOpacity>

          {/* Onglet 2 : SOUVENIRS */}
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'memories' && styles.activeTab]} 
            onPress={() => setActiveTab('memories')}
          >
            <Ionicons name="images-outline" size={20} color={activeTab === 'memories' ? '#1A1A1A' : '#999'} />
            <Text style={[styles.tabText, activeTab === 'memories' && styles.activeTabText]}>Souvenirs</Text>
          </TouchableOpacity>
        </View>

        {/* GRILLE DE CONTENU */}
        <FlatList
          data={activeTab === 'projects' ? MY_PROJECTS : MY_MEMORIES}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGridItem}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 100 }} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name={activeTab === 'projects' ? "planet-outline" : "camera-outline"} size={40} color="#ccc" />
              <Text style={styles.emptyText}>
                {activeTab === 'projects' ? "Aucun projet en cours." : "Pas encore de voyage terminé."}
              </Text>
            </View>
          }
        />

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  
  // HEADER
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 25,
    backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5,
    marginBottom: 20
  },
  avatarContainer: { marginRight: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#fff' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: '#00D668',
    width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff'
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  userHandle: { fontSize: 14, color: '#8E8E93', marginBottom: 10 },
  
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { alignItems: 'center', marginRight: 15 },
  statNumber: { fontSize: 16, fontWeight: '900', color: '#1A1A1A' },
  statLabel: { fontSize: 12, color: '#8E8E93' },
  divider: { width: 1, height: 20, backgroundColor: '#E5E5EA', marginRight: 15 },

  settingsButton: { position: 'absolute', top: 25, right: 25 },

  // TABS
  tabsContainer: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 15,
    backgroundColor: '#F2F2F7', borderRadius: 15, padding: 4
  },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, gap: 6 },
  activeTab: { backgroundColor: '#fff', shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#999' },
  activeTabText: { color: '#1A1A1A' },

  // GRID
  gridContainer: { paddingHorizontal: 15 },
  gridItem: {
    flex: 1, margin: 8, height: 200, borderRadius: 20, overflow: 'hidden', backgroundColor: '#fff',
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 3
  },
  gridImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  gridOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' }, // Un peu plus sombre pour lire le texte
  
  cardContent: { position: 'absolute', bottom: 15, left: 15, right: 15 },
  gridTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  gridDate: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2, fontWeight: '500' },

  statusBadge: {
    position: 'absolute', top: 10, right: 10,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8
  },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999', marginTop: 10 }
});

export default ProfileScreen;