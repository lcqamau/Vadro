import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { generateTrip, getAlternativeActivity, generateDayPlan } from '../utils/TripGenerator';
import client from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.4;
const CARD_WIDTH = width - 40;

const GeneratedTripScreen = ({ route, navigation }) => {
  const { vibes, days, travelers, budget, aiData, originalTripId, startDate } = route.params || {};

  if (!aiData) return null;

  // --- INITIALISATION DES DONNÉES ---
  const [tripData, setTripData] = useState(() => {
    const formattedData = { ...aiData };
    formattedData.days = formattedData.days.map(day => ({
      ...day,
      activities: day.activities || [{ 
        title: day.activityTitle, 
        desc: day.activityDesc, 
        image: `https://source.unsplash.com/random/200x100?travel` 
      }]
    }));
    return formattedData;
  });

  const [currentDays, setCurrentDays] = useState(days);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  // MODALE TITRE VOYAGE
  const [tripTitle, setTripTitle] = useState(tripData.destination || tripData.title || "Mon Voyage");
  const [editTitleModalVisible, setEditTitleModalVisible] = useState(false);
  const [tempTripTitle, setTempTripTitle] = useState('');

  // MODALE ÉDITION ACTIVITÉ
  const [editCardModalVisible, setEditCardModalVisible] = useState(false);
  const [editingIndices, setEditingIndices] = useState({ day: null, act: null });
  const [tempTitle, setTempTitle] = useState('');
  const [tempDesc, setTempDesc] = useState('');

  // SAUVEGARDE
  const [isSaving, setIsSaving] = useState(false);

  // IMAGE
  const [tripImage, setTripImage] = useState(tripData.image);

  // SCROLL ANIMATION
  const scrollY = useRef(new Animated.Value(0)).current;

  // FONCTION UPLOAD
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Besoin d\'accès à la galerie.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
        const localUri = result.assets[0].uri;
        
        // Création FormData
        const formData = new FormData();
        formData.append('image', {
            uri: localUri,
            name: 'upload.jpg',
            type: 'image/jpeg',
        });

        try {
            // Upload vers le backend
            const response = await client.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // Hack: récupérer la racine du serveur depuis baseURL
            const baseUrl = client.defaults.baseURL.replace('/api', ''); 
            const serverImageUrl = baseUrl + response.data.imageUrl;
            
            setTripImage(serverImageUrl);
            setTripData(prev => ({ ...prev, image: serverImageUrl }));

        } catch (error) {
            console.error("Upload error:", error);
            Alert.alert("Erreur", "Echec de l'upload.");
        }
    }
  };

  const handleSaveTrip = async () => {
      setIsSaving(true);
      try {
          const token = await AsyncStorage.getItem('userToken');
          if (!token) {
              Alert.alert("Connexion requise", "Connectez-vous pour sauvegarder votre voyage.");
              setIsSaving(false);
              return;
          }

          let flatSteps = [];
          
          let globalOrderIndex = 1;

          tripData.days.forEach((dayItem, dayIndex) => {
              dayItem.activities.forEach((act, actIndex) => {
                  flatSteps.push({
                      orderIndex: globalOrderIndex++,
                      day: dayItem.day,
                      title: act.title || "Activité", 
                      description: act.desc,
                      type: 'activity', 
                      imageUrl: act.image && act.image.startsWith('http') ? act.image : null
                  });
              });
          });

          const payload = {
              title: tripTitle,
              description: `Voyage de ${currentDays} jours${travelers ? ` pour ${travelers} personnes` : ''}.`,
              distanceKm: 0,
              durationDays: parseInt(currentDays),
              budgetEuro: typeof budget?.label === 'string' && budget.label.includes('€') ? parseInt(budget.label.replace(/[^0-9]/g, '')) || 0 : 0,
              imageUrl: tripImage || tripData.image, 
              tags: vibes || [],
              isPublic: false,
              startDate: startDate, 
              status: 'PLANNED',
              originalTrip: originalTripId ? { connect: { id: parseInt(originalTripId) } } : undefined,
              steps: flatSteps
          };

          const response = await client.post('/trips', payload);

          if (response.status === 201) {
              const newTrip = response.data;
              Alert.alert(
                  "Voyage enregistré ! 🎒",
                  "Votre voyage est sauvegardé. Voulez-vous le rendre public ?",
                  [
                      { text: "Garder privé 🔒", style: "cancel", onPress: () => navigation.replace('TripDetails', { trip: newTrip, isOwner: true }) },
                      { text: "Publier 🌍", onPress: async () => {
                              try {
                                  const updated = await client.put(`/trips/${newTrip.id}`, { isPublic: true });
                                  Alert.alert("Publié !", "Votre voyage est maintenant visible.");
                                  navigation.replace('TripDetails', { trip: updated.data, isOwner: true });
                              } catch (err) {
                                  Alert.alert("Erreur", "Sauvegardé mais non publié.");
                                  navigation.replace('TripDetails', { trip: newTrip, isOwner: true });
                              }
                          }
                      }
                  ]
              );
          }
      } catch (error) {
          console.error("Erreur sauvegarde:", error);
          Alert.alert("Erreur", error.response?.data?.details || "Impossible de sauvegarder.");
      } finally {
          setIsSaving(false);
      }
  };

  const openTitleEdit = () => {
      setTempTripTitle(tripTitle);
      setEditTitleModalVisible(true);
  };

  const saveTitleEdit = () => {
      if (tempTripTitle.trim()) {
        setTripTitle(tempTripTitle);
      }
      setEditTitleModalVisible(false);
  };

  // ... (ACTIONS INCHANGÉES)

  // ... (RENDER UI)
  
  // IN HEADER:
  /*
  <View style={styles.headerTitles}>
    <View style={styles.tagBadge}>...</View>
    <TouchableOpacity onPress={openTitleEdit} style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={styles.mainTitle}>{tripTitle}</Text>
        <Ionicons name="pencil" size={20} color="#fff" style={{marginLeft: 10, opacity: 0.8}} />
    </TouchableOpacity>
    <Text style={styles.subTitle}>...</Text>
  </View>
  */
  
  // ADD MODAL AT END


  // --- ACTIONS (Inchangées) ---
  const handleAddActivity = (dayIndex) => {
    const newTrip = { ...tripData };
    newTrip.days[dayIndex].activities.push({
      title: 'Nouvelle activité',
      desc: 'Description à éditer...',
      image: `https://source.unsplash.com/random/200x100?sig=${Math.random()}`
    });
    setTripData(newTrip);
    openEditCard(dayIndex, newTrip.days[dayIndex].activities.length - 1);
  };

  const handleDeleteActivity = (dayIndex, actIndex) => {
    Alert.alert("Supprimer ?", "Voulez-vous retirer cette activité ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: 'destructive', onPress: () => {
          const newTrip = { ...tripData };
          newTrip.days[dayIndex].activities.splice(actIndex, 1);
          setTripData(newTrip);
        }
      }
    ]);
  };

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
    if (day !== null && act !== null) {
        newTrip.days[day].activities[act].title = tempTitle;
        newTrip.days[day].activities[act].desc = tempDesc;
        setTripData(newTrip);
    }
    setEditCardModalVisible(false);
  };

  const handleSwapActivity = (dayIndex, actIndex) => {
    const currentActivity = tripData.days[dayIndex].activities[actIndex].title;
    const newTitle = getAlternativeActivity(tripData.destination, currentActivity);
    const newTrip = { ...tripData };
    newTrip.days[dayIndex].activities[actIndex].title = newTitle;
    setTripData({ ...newTrip });
  };

  const handleRegenerate = (newDays) => {
    const newData = generateTrip(vibes, parseInt(newDays), travelers, budget);
    newData.days = newData.days.map(d => ({
      ...d,
      activities: [{ title: d.activityTitle, desc: d.activityDesc, image: `https://source.unsplash.com/random/200x100?travel` }]
    }));
    setTripData(newData);
    setCurrentDays(parseInt(newDays));
    setSettingsModalVisible(false);
  };

  const moveActivity = (dayIndex, fromIndex, direction) => {
    const newTrip = { ...tripData };
    const activities = newTrip.days[dayIndex].activities;
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= activities.length) return;
    const itemToMove = activities[fromIndex];
    activities.splice(fromIndex, 1);
    activities.splice(toIndex, 0, itemToMove);
    setTripData(newTrip);
  };

  const handleDragPress = (dayIndex, actIndex) => {
    Alert.alert("Réorganiser", "Déplacer cette activité :", [
        { text: "Annuler", style: "cancel" },
        { text: "Monter ⬆️", onPress: () => moveActivity(dayIndex, actIndex, -1) },
        { text: "Descendre ⬇️", onPress: () => moveActivity(dayIndex, actIndex, 1) }
    ]);
  };

  const handleAutoFillDay = (dayIndex) => {
    Alert.alert("Magie ✨", "Remplir ce jour automatiquement ?", [
        { text: "Annuler", style: "cancel" },
        { text: "Remplir", onPress: () => {
            const newActivities = generateDayPlan(tripData.destination);
            const newTrip = { ...tripData };
            // On s'assure d'avoir des objets conformes
            newTrip.days[dayIndex].activities = newActivities;
            setTripData(newTrip);
        }}
    ]);
  };

  // --- RENDU UI PREMIUM ---

  const renderItinerary = () => {
    return tripData.days.map((dayItem, dayIndex) => (
      <View key={dayIndex} style={styles.daySection}>
        
        {/* EN-TÊTE JOUR (Sticky look) */}
        <View style={styles.dayHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex:1}}>
                <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>J{dayItem.day}</Text>
                </View>
                <Text style={styles.dayTitleLabel}>Jour {dayItem.day}</Text>
            </View>
            
            <TouchableOpacity onPress={() => handleAutoFillDay(dayIndex)} style={{backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="sparkles" size={14} color="#00D668" />
                <Text style={{color: '#00D668', fontWeight: 'bold', fontSize: 12, marginLeft: 6}}>Remplir (IA)</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.dayBody}>
            {/* Ligne verticale continue */}
            <View style={styles.timelineLine} />

            {/* LISTE ACTIVITÉS */}
            <View style={styles.activitiesList}>
                {dayItem.activities && dayItem.activities.map((act, actIndex) => (
                    <View key={actIndex} style={styles.activityRow}>
                        
                        {/* Point sur la timeline */}
                        <View style={styles.timelineDot} />
                        
                        <View style={styles.activityCard}>
                             {/* Image Header */}
                             <View style={styles.cardImageContainer}>
                                <Image source={{ uri: act.image || `https://source.unsplash.com/random/400x200?travel` }} style={styles.cardImage} contentFit="cover" transition={500} />
                                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.cardGradient} />
                                
                                <TouchableOpacity style={styles.dragBtn} onPress={() => handleDragPress(dayIndex, actIndex)}>
                                    <Ionicons name="reorder-two" size={20} color="#fff" />
                                </TouchableOpacity>

                                <Text style={styles.cardTitleOverImage} numberOfLines={2}>{act.title}</Text>
                             </View>

                             {/* Content Body */}
                             <View style={styles.cardContent}>
                                <Text style={styles.cardDesc} numberOfLines={3}>{act.desc}</Text>
                                
                                {/* Action Bar */}
                                <View style={styles.actionBar}>
                                    <TouchableOpacity style={styles.actionPill} onPress={() => openEditCard(dayIndex, actIndex)}>
                                        <Ionicons name="create-outline" size={16} color="#333" />
                                        <Text style={styles.actionText}>Éditer</Text>
                                    </TouchableOpacity>
                                    
                                    <View style={styles.verticalDivider} />

                                    <TouchableOpacity style={styles.actionPill} onPress={() => handleSwapActivity(dayIndex, actIndex)}>
                                        <MaterialCommunityIcons name="magic-staff" size={16} color="#00D668" />
                                        <Text style={[styles.actionText, {color: '#00D668'}]}>Remix IA</Text>
                                    </TouchableOpacity>

                                    <View style={{flex:1}}/>

                                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteActivity(dayIndex, actIndex)}>
                                        <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                             </View>
                        </View>
                    </View>
                ))}

                {/* BOUTON AJOUT STYLÉ */}
                <TouchableOpacity style={styles.addActivityBtn} onPress={() => handleAddActivity(dayIndex)}>
                    <View style={styles.addIconCircle}>
                        <Ionicons name="add" size={24} color="#fff" />
                    </View>
                    <Text style={styles.addText}>Ajouter une étape</Text>
                </TouchableOpacity>
            </View>
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* HEADER PARALLAX */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: tripImage || tripData.image }} style={styles.headerImage} contentFit="cover" transition={500} />
        <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent', '#FAFAFA']} style={styles.headerGradient} />
        
        <SafeAreaView style={styles.headerSafeArea}>
            <View style={styles.headerTopRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.glassBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSettingsModalVisible(true)} style={styles.glassBtn}>
                    <Ionicons name="settings-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.headerTitles}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                    <View style={styles.tagBadge}>
                        <Ionicons name="planet" size={12} color="#00D668" />
                        <Text style={styles.tagText}>MODE REMIX</Text>
                    </View>
                    <TouchableOpacity onPress={pickImage} style={[styles.glassBtn, {width: 'auto', paddingHorizontal: 15, flexDirection: 'row', gap: 8}]}>
                        <Ionicons name="camera" size={20} color="#fff" />
                        <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 12}}>Changer photo</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={openTitleEdit} style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.mainTitle}>{tripTitle}</Text>
                    <Ionicons name="pencil" size={24} color="#fff" style={{marginLeft: 10, opacity: 0.8, marginBottom: 5}} />
                </TouchableOpacity>
                <Text style={styles.subTitle}>{currentDays} Jours • {travelers || 1} Voyageurs</Text>
            </View>
        </SafeAreaView>
      </View>

      {/* CONTENU SCROLLABLE */}
      <Animated.ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        <View style={styles.introSection}>
            <Text style={styles.sectionHeaderTitle}>Votre Itinéraire</Text>
            <Text style={styles.sectionHeaderSub}>Personnalisez chaque étape selon vos envies.</Text>
        </View>

        <View style={styles.timelineWrapper}>
            {renderItinerary()}
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* FOOTER FLOTTANT */}
      <BlurView intensity={20} tint="light" style={styles.floatingFooter}>
        <TouchableOpacity 
            style={[styles.validateBtn, isSaving && styles.validateBtnDisabled]} 
            onPress={handleSaveTrip}
            disabled={isSaving}
        >
            {isSaving ? (
                 <Text style={styles.validateText}>Sauvegarde en cours...</Text>
            ) : (
                <>  
                    <Text style={styles.validateText}>Valider mon Remix</Text>
                    <View style={styles.validateIconBox}>
                        <Ionicons name="arrow-forward" size={20} color="#000" />
                    </View>
                </>
            )}
        </TouchableOpacity>
      </BlurView>

      {/* MODALE DURÉE */}
      <Modal animationType="slide" transparent={true} visible={settingsModalVisible} onRequestClose={() => setSettingsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajuster la durée ⏳</Text>
            <View style={styles.counterRow}>
                <TouchableOpacity onPress={() => setCurrentDays(Math.max(1, currentDays - 1))} style={styles.counterBtn}>
                    <Ionicons name="remove" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{currentDays}j</Text>
                <TouchableOpacity onPress={() => setCurrentDays(currentDays + 1)} style={styles.counterBtn}>
                    <Ionicons name="add" size={24} color="#1A1A1A" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.regenerateBtn} onPress={() => handleRegenerate(currentDays)}>
                <MaterialCommunityIcons name="robot-outline" size={24} color="#fff" style={{marginRight: 10}} />
                <Text style={styles.regenerateText}>Régénérer l'itinéraire</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSettingsModalVisible(false)} style={styles.closeModalBtn}>
                <Text style={styles.closeModalText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODALE TITRE VOYAGE */}
      <Modal animationType="fade" transparent={true} visible={editTitleModalVisible} onRequestClose={() => setEditTitleModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[styles.editModalCard, { alignItems: 'center' }]}>
            <Text style={[styles.editTitle, { marginBottom: 20 }]}>Nom du voyage ✏️</Text>
            
            <TextInput 
                style={[styles.inputField, { width: '100%', textAlign: 'center', fontSize: 20 }]} 
                value={tempTripTitle} 
                onChangeText={setTempTripTitle} 
                placeholder="Ex: Roadtrip en Italie..." 
                autoFocus
            />

            <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
                <TouchableOpacity style={[styles.saveEditBtn, {backgroundColor: '#ccc', flex:1}]} onPress={() => setEditTitleModalVisible(false)}>
                    <Text style={[styles.saveEditText, {color: '#333'}]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveEditBtn, {flex:1}]} onPress={saveTitleEdit}>
                    <Text style={styles.saveEditText}>Valider</Text>
                </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODALE ÉDITION ACTIVITÉ */}
      <Modal animationType="fade" transparent={true} visible={editCardModalVisible} onRequestClose={() => setEditCardModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.editModalCard}>
            <View style={styles.editHeader}>
                <Text style={styles.editTitle}>Modifier l'activité</Text>
                <TouchableOpacity onPress={() => setEditCardModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color="#ccc" />
                </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Titre</Text>
            <TextInput style={styles.inputField} value={tempTitle} onChangeText={setTempTitle} placeholder="Titre de l'étape" />
            
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput 
                style={[styles.inputField, styles.textArea]} 
                value={tempDesc} 
                onChangeText={setTempDesc} 
                multiline 
                textAlignVertical="top" 
                placeholder="Détails de l'activité..." 
            />

            <TouchableOpacity style={styles.saveEditBtn} onPress={saveCardEdit}>
                <Text style={styles.saveEditText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  
  // HEADER
  headerContainer: { height: HEADER_HEIGHT, width: '100%', position: 'absolute', top: 0, zIndex: 0 },
  headerImage: { width: '100%', height: '100%' },
  headerGradient: { position: 'absolute', top: 0, width: '100%', height: '100%' },
  headerSafeArea: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 40 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  glassBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  
  headerTitles: { marginTop: 20 },
  tagBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tagText: { color: '#00D668', fontWeight: '800', fontSize: 10, marginLeft: 6, letterSpacing: 0.5 },
  mainTitle: { fontSize: 36, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 10, marginBottom: 5 },
  subTitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  // SCROLL
  scrollView: { flex: 1, marginTop: HEADER_HEIGHT - 30, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: '#FAFAFA', overflow: 'hidden' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 30 },
  
  introSection: { marginBottom: 30 },
  sectionHeaderTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  sectionHeaderSub: { fontSize: 14, color: '#888', marginTop: 4 },

  // TIMELINE & CARDS
  daySection: { marginBottom: 30 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dayBadge: { backgroundColor: '#1A1A1A', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 10 },
  dayBadgeText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  dayTitleLabel: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },

  dayBody: { flexDirection: 'row' },
  timelineLine: { width: 2, backgroundColor: '#E0E0E0', marginLeft: 16, marginRight: 20 },
  activitiesList: { flex: 1 },

  activityRow: { flexDirection: 'row', marginBottom: 24 },
  timelineDot: { position: 'absolute', left: -25, top: 20, width: 12, height: 12, borderRadius: 6, backgroundColor: '#00D668', borderWidth: 2, borderColor: '#FAFAFA', zIndex: 10 },

  activityCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, overflow: 'hidden' },
  cardImageContainer: { height: 140, width: '100%', position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardGradient: { ...StyleSheet.absoluteFillObject },
  cardTitleOverImage: { position: 'absolute', bottom: 12, left: 15, right: 15, color: '#fff', fontSize: 18, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  dragBtn: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },

  cardContent: { padding: 16 },
  cardDesc: { color: '#666', fontSize: 14, lineHeight: 20, marginBottom: 16 },
  
  actionBar: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  actionPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginRight: 8 },
  actionText: { fontSize: 12, fontWeight: '600', color: '#333', marginLeft: 4 },
  verticalDivider: { width: 1, height: 20, backgroundColor: '#E0E0E0', marginHorizontal: 2 },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' },

  // ADD BTN
  addActivityBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 0, paddingVertical: 10 },
  addIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginLeft: -50, borderWidth: 3, borderColor: '#FAFAFA', zIndex: 10 },
  addText: { fontSize: 14, fontWeight: '700', color: '#888' },

  // FOOTER
  floatingFooter: { position: 'absolute', bottom: 30, left: 20, right: 20, borderRadius: 24, overflow: 'hidden' },
  validateBtn: { backgroundColor: '#1A1A1A', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: "#000", shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.3, shadowRadius: 10 },
  validateBtnDisabled: { opacity: 0.7 },
  validateText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  validateIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

  // MODALS
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 24, color: '#1A1A1A' },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30, gap: 20 },
  counterBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  counterValue: { fontSize: 32, fontWeight: '900', color: '#1A1A1A', minWidth: 60, textAlign: 'center' },
  regenerateBtn: { flexDirection: 'row', backgroundColor: '#00D668', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16, marginBottom: 16, width: '100%', justifyContent: 'center', alignItems: 'center' },
  regenerateText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closeModalBtn: { padding: 12 },
  closeModalText: { color: '#888', fontWeight: '600' },

  editModalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  editHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  editTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 6, textTransform: 'uppercase' },
  inputField: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 20 },
  textArea: { minHeight: 100 },
  saveEditBtn: { backgroundColor: '#1A1A1A', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  saveEditText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default GeneratedTripScreen;