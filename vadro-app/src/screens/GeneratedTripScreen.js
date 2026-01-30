import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { generateTrip, getAlternativeActivity } from '../utils/TripGenerator';

const { width, height } = Dimensions.get('window');

const GeneratedTripScreen = ({ route, navigation }) => {
  const { vibes, days, travelers, budget, aiData } = route.params || {};

  // Sécurité anti-crash
  if (!aiData) return null;

  // --- ÉTATS ---
  const [tripData, setTripData] = useState(aiData);
  const [currentDays, setCurrentDays] = useState(days);
  
  // Modale Durée
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  // 👇 NOUVEAU : Modale d'Édition de Texte
  const [editCardModalVisible, setEditCardModalVisible] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const [tempDesc, setTempDesc] = useState('');

  // --- ACTIONS ---

  // 1. Ouvrir la modale d'édition pour un jour précis
  const openEditCard = (index) => {
    setEditingDayIndex(index);
    setTempTitle(tripData.days[index].activityTitle);
    setTempDesc(tripData.days[index].activityDesc);
    setEditCardModalVisible(true);
  };

  // 2. Sauvegarder le texte manuel
  const saveCardEdit = () => {
    const newTrip = { ...tripData };
    newTrip.days[editingDayIndex].activityTitle = tempTitle;
    newTrip.days[editingDayIndex].activityDesc = tempDesc;
    
    setTripData(newTrip);
    setEditCardModalVisible(false);
  };

  // 3. Swap (IA) - On garde ça si jamais tu veux un mix des deux
  const handleSwapActivity = (dayIndex) => {
    const currentActivity = tripData.days[dayIndex].activityTitle;
    const newActivity = getAlternativeActivity(tripData.destination, currentActivity);
    const newTrip = { ...tripData };
    newTrip.days[dayIndex].activityTitle = newActivity;
    setTripData({ ...newTrip });
  };

  // 4. Régénérer (IA globale)
  const handleRegenerate = (newDays) => {
    const newTrip = generateTrip(vibes, parseInt(newDays), travelers, budget);
    setTripData(newTrip);
    setCurrentDays(parseInt(newDays));
    setSettingsModalVisible(false);
  };

  // --- RENDU ITINÉRAIRE ---
  const renderItinerary = () => {
    return tripData.days.map((item, index) => (
      <View key={index} style={styles.dayRow}>
        <View style={styles.timelineContainer}>
          <View style={styles.timelineDot} />
          {index !== tripData.days.length - 1 && <View style={styles.timelineLine} />}
        </View>
        
        <View style={styles.dayContent}>
          <Text style={styles.dayTitle}>Jour {item.day}</Text>
          
          <View style={styles.activityCard}>
            {/* Image (aléatoire pour décorer) */}
            <Image 
              source={{ uri: `https://source.unsplash.com/random/200x100?travel,${index}` }} 
              style={styles.activityImage} 
            />
            
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle} numberOfLines={2}>{item.activityTitle}</Text>
              <Text style={styles.activityDesc} numberOfLines={2}>{item.activityDesc}</Text>
            </View>

            {/* ZÔNE D'ACTIONS (Swap & Edit) */}
            <View style={styles.actionsColumn}>
              
              {/* BOUTON ÉDITER (CRAYON) ✏️ */}
              <TouchableOpacity style={styles.actionBtn} onPress={() => openEditCard(index)}>
                <Ionicons name="pencil" size={16} color="#1A1A1A" />
              </TouchableOpacity>

              {/* BOUTON SWAP (AUTO) 🔄 */}
              <TouchableOpacity style={[styles.actionBtn, {marginTop: 8}]} onPress={() => handleSwapActivity(index)}>
                <Ionicons name="sync" size={16} color="#00D668" />
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: tripData.image }} style={styles.headerImage} />
        <View style={styles.overlay} />
        
        <SafeAreaView style={styles.headerSafeArea}>
          <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.iconButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setSettingsModalVisible(true)}>
              <Ionicons name="options" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.headerTexts}>
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>Editable ✍️</Text>
          </View>
          <Text style={styles.tripTitle}>{tripData.destination}</Text>
          <Text style={styles.tripSubtitle}>{currentDays} Jours • {travelers} Pers.</Text>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.bodyContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Votre Planning</Text>
            <Text style={styles.hintText}>Appuyez sur <Ionicons name="pencil" /> pour écrire</Text>
          </View>
          
          <View style={styles.timelineWrapper}>
            {renderItinerary()}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookButton} onPress={() => alert('Voyage sauvegardé dans Projets !')}>
          <Text style={styles.bookText}>Valider ce voyage</Text>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* --- MODALE 1 : PARAMÈTRES (Durée) --- */}
      <Modal
        animationType="slide" transparent={true} visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier la durée</Text>
            <View style={styles.inputRow}>
              <TouchableOpacity onPress={() => setCurrentDays(Math.max(1, currentDays - 1))} style={styles.plusMinusBtn}>
                <Ionicons name="remove" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.daysValue}>{currentDays}j</Text>
              <TouchableOpacity onPress={() => setCurrentDays(currentDays + 1)} style={styles.plusMinusBtn}>
                <Ionicons name="add" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.regenerateBtn} onPress={() => handleRegenerate(currentDays)}>
              <Text style={styles.regenerateText}>Mettre à jour (Reset)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSettingsModalVisible(false)}><Text style={styles.cancelText}>Annuler</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODALE 2 : ÉDITION DE TEXTE (MANUEL) --- */}
      <Modal
        animationType="fade" transparent={true} visible={editCardModalVisible}
        onRequestClose={() => setEditCardModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          
          <View style={styles.editCardModal}>
            <Text style={styles.modalTitle}>Jour {editingDayIndex + 1} 📝</Text>
            
            <Text style={styles.label}>Titre de l'activité</Text>
            <TextInput 
              style={styles.inputTitle} 
              value={tempTitle} onChangeText={setTempTitle}
              placeholder="Ex: Visite du Louvre"
            />

            <Text style={styles.label}>Description / Notes</Text>
            <TextInput 
              style={styles.inputDesc} 
              value={tempDesc} onChangeText={setTempDesc}
              placeholder="Détails, horaires, adresse..."
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtnSmall} onPress={() => setEditCardModalVisible(false)}>
                <Text style={{color:'#666'}}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtnSmall} onPress={saveCardEdit}>
                <Text style={{color:'#fff', fontWeight:'bold'}}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  
  // HEADER
  headerContainer: { height: height * 0.35, width: width }, // Un peu moins haut
  headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  
  headerSafeArea: { 
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 
  },
  iconButton: { width: 45, height: 45, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },

  headerTexts: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  tagContainer: { backgroundColor: '#1A1A1A', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  tagText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  tripTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 2, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 },
  tripSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  // BODY
  bodyContainer: { flex: 1, marginTop: -25, backgroundColor: '#FAFAFA', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  scrollContent: { padding: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  hintText: { fontSize: 12, color: '#8E8E93' },

  // TIMELINE
  timelineWrapper: { paddingLeft: 10 },
  dayRow: { flexDirection: 'row', marginBottom: 0 },
  timelineContainer: { alignItems: 'center', width: 30, marginRight: 15 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#1A1A1A', borderWidth: 3, borderColor: '#fff', zIndex: 2 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E5E5EA', marginVertical: -2, zIndex: 1 },
  
  dayContent: { flex: 1, paddingBottom: 25 },
  dayTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  
  // CARTE ACTIVITÉ
  activityCard: { 
    backgroundColor: '#fff', borderRadius: 15, padding: 10, flexDirection: 'row', 
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    alignItems: 'center'
  },
  activityImage: { width: 60, height: 60, borderRadius: 10, marginRight: 12, backgroundColor: '#eee' },
  activityInfo: { flex: 1, marginRight: 5 },
  activityTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  activityDesc: { fontSize: 12, color: '#8E8E93' },
  
  // ACTIONS (Boutons droite)
  actionsColumn: { alignItems: 'center', justifyContent: 'center', marginLeft: 5 },
  actionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },

  // FOOTER
  footer: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  bookButton: { backgroundColor: '#1A1A1A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 25, gap: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  bookText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // MODALS
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 25, padding: 25, alignItems: 'center' },
  
  // MODAL EDIT TEXTE
  editCardModal: { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#1A1A1A', textAlign: 'center' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#8E8E93', marginBottom: 5, marginTop: 10 },
  inputTitle: { backgroundColor: '#F2F2F7', borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  inputDesc: { backgroundColor: '#F2F2F7', borderRadius: 10, padding: 12, fontSize: 14, color: '#1A1A1A', textAlignVertical: 'top', minHeight: 80 },
  
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  cancelBtnSmall: { flex: 1, padding: 15, alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 12, marginRight: 10 },
  saveBtnSmall: { flex: 1, padding: 15, alignItems: 'center', backgroundColor: '#00D668', borderRadius: 12 },

  // MODAL SETTINGS
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 30 },
  plusMinusBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  daysValue: { fontSize: 24, fontWeight: '900', color: '#1A1A1A' },
  regenerateBtn: { backgroundColor: '#1A1A1A', width: '100%', paddingVertical: 15, borderRadius: 15, alignItems: 'center', marginBottom: 10 },
  regenerateText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelText: { color: '#8E8E93', fontWeight: '600', padding: 10 }
});

export default GeneratedTripScreen;