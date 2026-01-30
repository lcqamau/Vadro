import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { generateTrip, getAlternativeActivity } from '../utils/TripGenerator';

const { width, height } = Dimensions.get('window');

const GeneratedTripScreen = ({ route, navigation }) => {
  const { vibes, days, travelers, budget, aiData } = route.params || {};

  if (!aiData) return null;

  // --- INITIALISATION DES DONNÉES (Transformation en liste) ---
  // On transforme le format "1 activité" en "Tableau d'activités" pour pouvoir en ajouter
  const [tripData, setTripData] = useState(() => {
    const formattedData = { ...aiData };
    formattedData.days = formattedData.days.map(day => ({
      ...day,
      // Si 'activities' existe déjà on garde, sinon on crée un tableau avec l'activité unique
      activities: day.activities || [{ 
        title: day.activityTitle, 
        desc: day.activityDesc, 
        image: `https://source.unsplash.com/random/200x100?travel` // On ajoute une image par défaut
      }]
    }));
    return formattedData;
  });

  const [currentDays, setCurrentDays] = useState(days);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  // MODALE ÉDITION
  const [editCardModalVisible, setEditCardModalVisible] = useState(false);
  const [editingIndices, setEditingIndices] = useState({ day: null, act: null });
  const [tempTitle, setTempTitle] = useState('');
  const [tempDesc, setTempDesc] = useState('');

  // --- ACTIONS ---

  // 1. AJOUTER UNE ACTIVITÉ (+)
  const handleAddActivity = (dayIndex) => {
    const newTrip = { ...tripData };
    newTrip.days[dayIndex].activities.push({
      title: 'Nouvelle activité',
      desc: 'Description à éditer...',
      image: `https://source.unsplash.com/random/200x100?sig=${Math.random()}`
    });
    setTripData(newTrip);
    
    // On ouvre directement l'éditeur pour la nouvelle activité
    openEditCard(dayIndex, newTrip.days[dayIndex].activities.length - 1);
  };

  // 2. SUPPRIMER UNE ACTIVITÉ (Poubelle)
  const handleDeleteActivity = (dayIndex, actIndex) => {
    Alert.alert("Supprimer ?", "Voulez-vous retirer cette activité ?", [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Supprimer", 
        style: 'destructive',
        onPress: () => {
          const newTrip = { ...tripData };
          newTrip.days[dayIndex].activities.splice(actIndex, 1);
          setTripData(newTrip);
        }
      }
    ]);
  };

  // 3. ÉDITER UNE ACTIVITÉ (Crayon)
  const openEditCard = (dayIndex, actIndex) => {
    const activity = tripData.days[dayIndex].activities[actIndex];
    setEditingIndices({ day: dayIndex, act: actIndex });
    setTempTitle(activity.title);
    setTempDesc(activity.desc);
    setEditCardModalVisible(true);
  };

  const saveCardEdit = () => {
    const newTrip = { ...tripData };
    const { day, act } = editingIndices;
    newTrip.days[day].activities[act].title = tempTitle;
    newTrip.days[day].activities[act].desc = tempDesc;
    setTripData(newTrip);
    setEditCardModalVisible(false);
  };

  // 4. SWAP (IA)
  const handleSwapActivity = (dayIndex, actIndex) => {
    const currentActivity = tripData.days[dayIndex].activities[actIndex].title;
    const newTitle = getAlternativeActivity(tripData.destination, currentActivity);
    
    const newTrip = { ...tripData };
    newTrip.days[dayIndex].activities[actIndex].title = newTitle;
    setTripData({ ...newTrip });
  };

  // 5. RÉGÉNÉRER TOUT (Reset)
  const handleRegenerate = (newDays) => {
    const newData = generateTrip(vibes, parseInt(newDays), travelers, budget);
    // On reformate immédiatement
    newData.days = newData.days.map(d => ({
      ...d,
      activities: [{ title: d.activityTitle, desc: d.activityDesc, image: `https://source.unsplash.com/random/200x100?travel` }]
    }));
    
    setTripData(newData);
    setCurrentDays(parseInt(newDays));
    setSettingsModalVisible(false);
  };

  // 6. DÉPLACER UNE ACTIVITÉ (Monter/Descendre)
  const moveActivity = (dayIndex, fromIndex, direction) => {
    const newTrip = { ...tripData };
    const activities = newTrip.days[dayIndex].activities;
    const toIndex = fromIndex + direction;

    // Vérification des limites (ne pas monter le premier ou descendre le dernier)
    if (toIndex < 0 || toIndex >= activities.length) return;

    // On échange les deux éléments (Swap)
    const itemToMove = activities[fromIndex];
    activities.splice(fromIndex, 1); // On l'enlève
    activities.splice(toIndex, 0, itemToMove); // On le remet à la nouvelle place

    setTripData(newTrip);
  };

  // Petit menu pour choisir la direction quand on clique sur la poignée
  const handleDragPress = (dayIndex, actIndex) => {
    Alert.alert(
      "Déplacer l'activité",
      "Où voulez-vous mettre cette activité ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Monter ⬆️", onPress: () => moveActivity(dayIndex, actIndex, -1) },
        { text: "Descendre ⬇️", onPress: () => moveActivity(dayIndex, actIndex, 1) }
      ]
    );
  };


  // --- RENDU ITINÉRAIRE ---
  const renderItinerary = () => {
    return tripData.days.map((dayItem, dayIndex) => (
      <View key={dayIndex} style={styles.dayBlock}>
        
        {/* Ligne Temporelle (gauche) */}
        <View style={styles.timelineLeft}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineLine} />
        </View>

        <View style={styles.dayContent}>
          <Text style={styles.dayTitle}>Jour {dayItem.day}</Text>

          {/* LISTE DES ACTIVITÉS DU JOUR */}
          {dayItem.activities.map((act, actIndex) => (
            <View key={actIndex} style={styles.activityCard}>
              
              {/* 👇 NOUVEAU : LE DRAG HANDLE (Barre verte + Points) */}
              <TouchableOpacity 
                style={styles.dragHandle} 
                onPress={() => handleDragPress(dayIndex, actIndex)}
                activeOpacity={0.6}
              >
                <View style={styles.dragBar} />
                <Ionicons name="grid" size={12} color="#D1D1D6" style={{ marginLeft: 2 }} />
              </TouchableOpacity>

              {/* IMAGE */}
              <Image 
                source={{ uri: act.image || `https://source.unsplash.com/random/200x100?travel` }} 
                style={styles.activityImage} 
              />
              
              {/* TEXTES */}
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle} numberOfLines={2}>{act.title}</Text>
                <Text style={styles.activityDesc} numberOfLines={2}>{act.desc}</Text>
              </View>

              {/* ACTIONS (Crayon, Swap, Poubelle) */}
              <View style={styles.actionsColumn}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEditCard(dayIndex, actIndex)}>
                  <Ionicons name="pencil" size={14} color="#1A1A1A" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, {marginTop: 6}]} onPress={() => handleSwapActivity(dayIndex, actIndex)}>
                  <Ionicons name="sync" size={14} color="#00D668" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, {marginTop: 6, backgroundColor:'#FFEBEE'}]} onPress={() => handleDeleteActivity(dayIndex, actIndex)}>
                  <Ionicons name="trash" size={14} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* BOUTON AJOUTER (+) */}
          <TouchableOpacity style={styles.addBtn} onPress={() => handleAddActivity(dayIndex)}>
            <Ionicons name="add-circle" size={20} color="#00D668" />
            <Text style={styles.addBtnText}>Ajouter une activité</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER (Identique) */}
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

      {/* BODY SCROLLABLE */}
      <View style={styles.bodyContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Votre Planning</Text>
            <Text style={styles.hintText}>Customisez chaque journée</Text>
          </View>
          
          <View style={styles.timelineWrapper}>
            {renderItinerary()}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookButton} onPress={() => alert('Voyage sauvegardé !')}>
          <Text style={styles.bookText}>Valider le Voyage</Text>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* MODALE DUREE */}
      <Modal animationType="slide" transparent={true} visible={settingsModalVisible} onRequestClose={() => setSettingsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier la durée</Text>
            <View style={styles.inputRow}>
              <TouchableOpacity onPress={() => setCurrentDays(Math.max(1, currentDays - 1))} style={styles.plusMinusBtn}><Ionicons name="remove" size={24} /></TouchableOpacity>
              <Text style={styles.daysValue}>{currentDays}j</Text>
              <TouchableOpacity onPress={() => setCurrentDays(currentDays + 1)} style={styles.plusMinusBtn}><Ionicons name="add" size={24} /></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.regenerateBtn} onPress={() => handleRegenerate(currentDays)}>
              <Text style={styles.regenerateText}>Régénérer (Reset)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSettingsModalVisible(false)}><Text style={styles.cancelText}>Annuler</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODALE TEXTE */}
      <Modal animationType="fade" transparent={true} visible={editCardModalVisible} onRequestClose={() => setEditCardModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.editCardModal}>
            <Text style={styles.modalTitle}>Modifier l'activité 📝</Text>
            <Text style={styles.label}>Titre</Text>
            <TextInput style={styles.inputTitle} value={tempTitle} onChangeText={setTempTitle} />
            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.inputDesc} value={tempDesc} onChangeText={setTempDesc} multiline numberOfLines={3} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtnSmall} onPress={() => setEditCardModalVisible(false)}><Text style={{color:'#666'}}>Annuler</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtnSmall} onPress={saveCardEdit}><Text style={{color:'#fff', fontWeight:'bold'}}>OK</Text></TouchableOpacity>
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
  headerContainer: { height: height * 0.35, width: width },
  headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  headerSafeArea: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  iconButton: { width: 45, height: 45, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  headerTexts: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  tagContainer: { backgroundColor: '#1A1A1A', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  tagText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  tripTitle: { fontSize: 32, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 },
  tripSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  // BODY
  bodyContainer: { flex: 1, marginTop: -25, backgroundColor: '#FAFAFA', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  scrollContent: { padding: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  hintText: { fontSize: 12, color: '#8E8E93' },

  // BLOC JOUR
  dayBlock: { flexDirection: 'row', marginBottom: 20 },
  timelineLeft: { alignItems: 'center', width: 30, marginRight: 10 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#1A1A1A', borderWidth: 3, borderColor: '#fff', zIndex: 2 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E5E5EA', marginVertical: -2, zIndex: 1 },
  
  dayContent: { flex: 1 },
  dayTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10, marginTop: -4 },

  // CARTE ACTIVITÉ
  activityCard: { 
    backgroundColor: '#fff', borderRadius: 15, padding: 10, flexDirection: 'row', 
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    alignItems: 'center', marginBottom: 10 
  },
  activityImage: { width: 60, height: 60, borderRadius: 10, marginRight: 12, backgroundColor: '#eee' },
  activityInfo: { flex: 1, marginRight: 5 },
  activityTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  activityDesc: { fontSize: 12, color: '#8E8E93' },
  
  // ACTIONS
  actionsColumn: { alignItems: 'center', justifyContent: 'center', marginLeft: 5 },
  actionBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },

  // BOUTON AJOUTER
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderWidth: 1, borderColor: '#00D668', borderRadius: 12, borderStyle: 'dashed', marginTop: 5 },
  addBtnText: { color: '#00D668', fontWeight: 'bold', marginLeft: 8, fontSize: 14 },

  // FOOTER & MODALS (Styles Standards)
  footer: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  bookButton: { backgroundColor: '#1A1A1A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 25, gap: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  bookText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 25, padding: 25, alignItems: 'center' },
  editCardModal: { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#1A1A1A', textAlign: 'center' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#8E8E93', marginBottom: 5, marginTop: 10 },
  inputTitle: { backgroundColor: '#F2F2F7', borderRadius: 10, padding: 12, fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  inputDesc: { backgroundColor: '#F2F2F7', borderRadius: 10, padding: 12, fontSize: 14, color: '#1A1A1A', textAlignVertical: 'top', minHeight: 80 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  cancelBtnSmall: { flex: 1, padding: 15, alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 12, marginRight: 10 },
  saveBtnSmall: { flex: 1, padding: 15, alignItems: 'center', backgroundColor: '#00D668', borderRadius: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 30 },
  plusMinusBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  daysValue: { fontSize: 24, fontWeight: '900', color: '#1A1A1A' },
  regenerateBtn: { backgroundColor: '#1A1A1A', width: '100%', paddingVertical: 15, borderRadius: 15, alignItems: 'center', marginBottom: 10 },
  regenerateText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelText: { color: '#8E8E93', fontWeight: '600', padding: 10 }
});

export default GeneratedTripScreen;