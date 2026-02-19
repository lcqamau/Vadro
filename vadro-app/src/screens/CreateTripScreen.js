import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import client from '../api/client';
import { generateTrip } from '../utils/TripGenerator'; 
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { LinearGradient } from 'expo-linear-gradient'; 

const { width } = Dimensions.get('window');

// CONFIG DU QUIZ (Mode IA)
const STEPS_IA = [
  { id: 1, title: 'Ambiance ?', type: 'vibes' },
  { id: 2, title: 'Durée ?', type: 'days' },
  { id: 3, title: 'Voyageurs ?', type: 'travelers' },
  { id: 4, title: 'Budget ?', type: 'budget' },
];

const VIBES = [
  { id: 'nature', label: 'Nature 🌿', color: '#4CAF50' },
  { id: 'party', label: 'Fête 🎉', color: '#E91E63' },
  { id: 'chill', label: 'Détente 🏖️', color: '#2196F3' },
  { id: 'culture', label: 'Culture 🏛️', color: '#FF9800' },
  { id: 'food', label: 'Gastronomie 🍜', color: '#FF5722' },
  { id: 'adventure', label: 'Aventure 🎒', color: '#795548' },
];

const CreateTripScreen = ({ navigation }) => {
  // MODE : 'choice' (début), 'ai' (quiz), 'manual' (formulaire)
  const [mode, setMode] = useState('choice'); 
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- DONNÉES IA ---
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [days, setDays] = useState(7);
  const [travelers, setTravelers] = useState(2);
  const [selectedBudget, setSelectedBudget] = useState(null);

  // --- DONNÉES MANUELLES ---
  const [manualDest, setManualDest] = useState('');
  const [manualDays, setManualDays] = useState(3);
  const [manualBudget, setManualBudget] = useState('');
  const [manualImage, setManualImage] = useState(null);
  
  // Date
  const [manualStartDate, setManualStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || manualStartDate;
    setShowDatePicker(Platform.OS === 'ios'); // Sur Android ça ferme auto
    setManualStartDate(currentDate);
  };

  const pickImage = async () => {
   // ... (unchanged)
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
        setManualImage(localUri);
        
        const formData = new FormData();
        formData.append('image', {
            uri: localUri,
            name: 'manual_trip.jpg',
            type: 'image/jpeg',
        });

        try {
            const response = await client.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const baseUrl = client.defaults.baseURL.replace('/api', ''); 
            const serverImageUrl = baseUrl + response.data.imageUrl;
            setManualImage(serverImageUrl);
        } catch (error) {
            console.error("Upload error:", error);
            Alert.alert("Erreur", "Echec de l'upload.");
        }
    }
  };

  // ... 

  // --- LOGIQUE MANUELLE ---
  const handleCreateManual = () => {
    if (manualDest.trim() === '') {
      Alert.alert("Oups", "Il faut au moins un nom de destination !");
      return;
    }

    setIsGenerating(true);
    // On simule une création rapide
    setTimeout(() => {
      // On crée un objet "Voyage Vide"
      const blankTrip = {
        destination: manualDest,
        // Image personnalisée ou par défaut
        image: manualImage || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1', 
        priceEstimate: manualBudget ? `${manualBudget} €` : 'À définir',
        destinationId: 'manual',
        startDate: manualStartDate.toISOString(), // Ajout date
        days: Array.from({ length: manualDays }, (_, i) => ({
          day: i + 1,
          title: `Jour ${i + 1}`,
          activityTitle: 'Journée libre',
          activityDesc: 'Programme à définir par vos soins.'
        }))
      };

      setIsGenerating(false);
      
      // On envoie vers l'écran de résultat (qui est modifiable)
      navigation.replace('GeneratedTrip', {
        aiData: blankTrip,
        vibes: ['custom'],
        days: manualDays,
        travelers: 1,
        budget: { label: manualBudget ? `${manualBudget} €` : 'Perso' },
        startDate: manualStartDate.toISOString(), // Ajout date aux params
      });
    }, 1000);
  };

  // --- NAVIGATION RETOUR ---
  const handleBack = () => {
    if (mode === 'choice') navigation.goBack();
    else if (mode === 'manual') setMode('choice');
    else if (mode === 'ai') {
      if (step > 1) setStep(step - 1);
      else setMode('choice');
    }
  };

  // --- RENDU : ÉCRAN DE CHOIX (Étape 0) ---
  const renderChoiceScreen = () => (
    <View style={styles.choiceContainer}>
      <Text style={styles.mainTitle}>Créer un voyage 🌍</Text>
      <Text style={styles.subTitle}>Comment veux-tu procéder ?</Text>

      <TouchableOpacity style={styles.choiceCard} onPress={() => setMode('ai')}>
        <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
          <Ionicons name="sparkles" size={32} color="#00D668" />
        </View>
        <View style={styles.choiceTextContainer}>
          <Text style={styles.choiceTitle}>Générateur Magique</Text>
          <Text style={styles.choiceDesc}>Laisse l'IA te proposer un itinéraire sur mesure en 3 clics.</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.choiceCard} onPress={() => setMode('manual')}>
        <View style={[styles.iconBox, { backgroundColor: '#F2F2F7' }]}>
          <Ionicons name="create" size={32} color="#1A1A1A" />
        </View>
        <View style={styles.choiceTextContainer}>
          <Text style={styles.choiceTitle}>Création Manuelle</Text>
          <Text style={styles.choiceDesc}>Pars d'une page blanche et construis ton voyage toi-même.</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>
    </View>
  );
  // --- RENDU : FORMULAIRE MANUEL ---
  const renderManualForm = () => (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1, paddingBottom: 100}}>
        
        {/* HERO IMAGE SECTION */}
        <TouchableOpacity 
          onPress={pickImage} 
          style={styles.heroContainer}
          activeOpacity={0.9}
        >
          {manualImage ? (
             <Image source={{ uri: manualImage }} style={styles.heroImage} resizeMode="cover" />
          ) : (
             <LinearGradient colors={['#F0F0F0', '#E0E0E0']} style={[styles.heroImage, {justifyContent: 'center', alignItems: 'center'}]}>
                <Ionicons name="camera" size={40} color="#ccc" />
                <Text style={styles.addPhotoText}>Ajouter une photo</Text>
             </LinearGradient>
          )}
          
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.heroOverlay} />
          
          <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{manualDest || "Nouveau Voyage"}</Text>
              <Text style={styles.heroSubtitle}>Créez votre propre aventure 🌍</Text>
          </View>

          <View style={styles.editBadge}>
              <Ionicons name="pencil" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* FORMULAIRE FLOTTANT */}
        <View style={styles.formSection}>
            
            {/* Input Destination */}
            <View style={styles.modernInputCard}>
                <View style={styles.iconCircle}>
                    <Ionicons name="location" size={22} color="#00D668" />
                </View>
                <View style={{flex:1}}>
                    <Text style={styles.inputLabelSm}>Destination</Text>
                    <TextInput 
                        style={styles.modernInput} 
                        placeholder="Ex: Roadtrip en Italie..." 
                        placeholderTextColor="#ccc"
                        value={manualDest}
                        onChangeText={setManualDest}
                    />
                </View>
            </View>

            {/* Row: Date + Durée */}
            <View style={styles.rowContainer}>
                {/* Date */}
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.modernInputCard, {flex: 1, marginRight: 8}]}>
                    <View style={{marginBottom: 4}}>
                         <Text style={styles.inputLabelSm}>Départ</Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Ionicons name="calendar-outline" size={20} color="#1A1A1A" style={{marginRight: 8}} />
                        <Text style={styles.valueText}>
                            {manualStartDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Durée */}
                <View style={[styles.modernInputCard, {flex: 1, marginLeft: 8}]}>
                    <View style={{marginBottom: 4}}>
                         <Text style={styles.inputLabelSm}>Durée</Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <TouchableOpacity onPress={() => setManualDays(Math.max(1, manualDays - 1))} style={styles.miniBtn}>
                             <Ionicons name="remove" size={16} color="#1A1A1A" />
                        </TouchableOpacity>
                        <Text style={styles.valueText}>{manualDays} j</Text>
                        <TouchableOpacity onPress={() => setManualDays(manualDays + 1)} style={styles.miniBtn}>
                             <Ionicons name="add" size={16} color="#1A1A1A" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {showDatePicker && (
                <DateTimePicker
                value={manualStartDate}
                mode="date"
                display="default"
                onChange={onChangeDate}
                minimumDate={new Date()}
                />
            )}
  
            {/* Budget */}
            <View style={styles.modernInputCard}>
                <View style={styles.iconCircle}>
                    <Ionicons name="wallet" size={22} color="#00D668" />
                </View>
                <View style={{flex:1}}>
                    <Text style={styles.inputLabelSm}>Budget Global (€)</Text>
                    <TextInput 
                        style={styles.modernInput} 
                        placeholder="Ex: 1500" 
                        placeholderTextColor="#ccc"
                        value={manualBudget} 
                        onChangeText={setManualBudget} 
                        keyboardType="numeric"
                    />
                </View>
            </View>

        </View>
        
        <View style={{height: 100}} /> 
      </ScrollView>

      {/* FOOTER ACTION */}
      <View style={styles.floatingFooter}>
        <TouchableOpacity style={styles.createBtn} onPress={handleCreateManual}>
          <Text style={styles.createBtnText}>Lancer la création</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );

  // --- RENDU : STEPS QUIZ IA (Ancien code) ---
  const renderQuizContent = () => {
    switch (step) {
      case 1: // Vibes
        return (
          <View style={styles.grid}>
            {VIBES.map((vibe) => (
              <TouchableOpacity
                key={vibe.id}
                style={[styles.vibeCard, selectedVibes.includes(vibe.id) && { borderColor: vibe.color, backgroundColor: vibe.color + '20' }]}
                onPress={() => toggleVibe(vibe.id)}
              >
                <Text style={styles.vibeText}>{vibe.label}</Text>
                {selectedVibes.includes(vibe.id) && <Ionicons name="checkmark-circle" size={20} color={vibe.color} style={{position:'absolute', top:5, right:5}}/>}
              </TouchableOpacity>
            ))}
          </View>
        );
      case 2: // Jours
        return (
          <View style={styles.centerContent}>
            <Text style={styles.bigNumber}>{days} Jours</Text>
            <View style={styles.row}>
              <TouchableOpacity onPress={() => setDays(Math.max(1, days - 1))} style={styles.roundBtn}><Ionicons name="remove" size={30} /></TouchableOpacity>
              <TouchableOpacity onPress={() => setDays(days + 1)} style={styles.roundBtn}><Ionicons name="add" size={30} /></TouchableOpacity>
            </View>
          </View>
        );
      case 3: // Voyageurs
        return (
          <View style={styles.centerContent}>
            <Text style={styles.bigNumber}>{travelers} Pers.</Text>
            <View style={styles.row}>
              <TouchableOpacity onPress={() => setTravelers(Math.max(1, travelers - 1))} style={styles.roundBtn}><Ionicons name="remove" size={30} /></TouchableOpacity>
              <TouchableOpacity onPress={() => setTravelers(travelers + 1)} style={styles.roundBtn}><Ionicons name="add" size={30} /></TouchableOpacity>
            </View>
          </View>
        );
      case 4: // Budget
        return (
          <View style={styles.list}>
            {[
              { id: 'eco', label: 'Économique 🎒', desc: 'Moins de 1000€' },
              { id: 'standard', label: 'Confort 🧳', desc: '1000€ - 2500€' },
              { id: 'luxe', label: 'Luxe ✨', desc: 'Plus de 2500€' },
            ].map((b) => (
              <TouchableOpacity
                key={b.id}
                style={[styles.budgetCard, selectedBudget?.id === b.id && styles.activeBudget]}
                onPress={() => setSelectedBudget(b)}
              >
                <Text style={styles.budgetLabel}>{b.label}</Text>
                <Text style={styles.budgetDesc}>{b.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      default: return null;
    }
  };

  // --- ÉCRAN DE CHARGEMENT ---
  if (isGenerating) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }]}>
        <Ionicons name="planet" size={80} color="#00D668" />
        <Text style={{ color: '#fff', marginTop: 20, fontSize: 18, fontWeight: 'bold' }}>
          {mode === 'ai' ? "L'IA prépare votre voyage..." : "Création du projet..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Header commun */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          
          {/* Barre de progression seulement si Mode IA */}
          {mode === 'ai' && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${(step / STEPS_IA.length) * 100}%` }]} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          {mode === 'choice' && renderChoiceScreen()}
          
          {mode === 'manual' && renderManualForm()}

          {mode === 'ai' && (
            <>
              <Text style={styles.stepTitle}>{STEPS_IA[step - 1].title}</Text>
              {renderQuizContent()}
              
              {/* Le bouton suivant est en bas pour le mode IA */}
              <View style={styles.bottomSpacer} />
              <TouchableOpacity style={styles.nextBtn} onPress={handleNextIA}>
                <Text style={styles.nextText}>{step === STEPS_IA.length ? 'Générer ✨' : 'Continuer'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  progressContainer: { flex: 1, height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#00D668' },
  content: { flex: 1, padding: 25 },
  
  // Écran de Choix
  choiceContainer: { flex: 1, marginTop: 20 },
  mainTitle: { fontSize: 32, fontWeight: '900', color: '#1A1A1A', marginBottom: 10 },
  subTitle: { fontSize: 18, color: '#8E8E93', marginBottom: 30 },
  choiceCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 20,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
  },
  iconBox: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  choiceTextContainer: { flex: 1 },
  choiceTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  choiceDesc: { fontSize: 13, color: '#8E8E93', lineHeight: 18 },

  // Formulaire Manuel
  label: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 15 },
  input: { backgroundColor: '#fff', padding: 20, borderRadius: 15, fontSize: 18, borderWidth: 1, borderColor: '#eee', marginBottom: 30 },
  inputGroup: { marginBottom: 30 },

  // Styles communs Quiz
  stepTitle: { fontSize: 32, fontWeight: '900', marginBottom: 30, color: '#1A1A1A' },
  nextBtn: { backgroundColor: '#1A1A1A', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  nextText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bottomSpacer: { flex: 1 },

  // Composants Quiz
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  vibeCard: { width: (width - 70) / 2, padding: 20, borderRadius: 15, borderWidth: 2, borderColor: '#eee', backgroundColor: '#fff', marginBottom: 10 },
  vibeText: { fontWeight: 'bold', fontSize: 16 },
  centerContent: { alignItems: 'center', marginTop: 20 },
  bigNumber: { fontSize: 48, fontWeight: 'bold', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 30, alignItems:'center' },
  roundBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  list: { gap: 15 },
  budgetCard: { padding: 20, borderRadius: 15, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  activeBudget: { borderColor: '#00D668', backgroundColor: '#F0FFF4' },
  budgetLabel: { fontSize: 18, fontWeight: 'bold' },
  budgetDesc: { color: '#666' },
  
  dateBtn: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, 
      borderRadius: 15, borderWidth: 1, borderColor: '#eee', gap: 10
  },
  dateText: { fontSize: 16, color: '#1A1A1A', fontWeight: '500', textTransform: 'capitalize' },
  // Nouveau Design Styles
  heroContainer: {
     height: 380, width: '100%', position: 'relative',
     borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
     overflow: 'hidden', backgroundColor: '#eee',
     marginBottom: 20
  },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  addPhotoText: { marginTop: 10, color: '#888', fontWeight: 'bold' },
  heroContent: { position: 'absolute', bottom: 40, left: 25, right: 25 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 10 },
  heroSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 5 },
  editBadge: { position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  
  formSection: { paddingHorizontal: 20, marginTop: -30 },
  modernInputCard: {
     flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20,
     padding: 15, marginBottom: 15,
     shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  inputLabelSm: { fontSize: 10, fontWeight: 'bold', color: '#888', textTransform: 'uppercase', marginBottom: 2 },
  modernInput: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', padding: 0 },
  
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 0 },
  valueText: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  miniBtn: { height: 32, backgroundColor: '#F0F0F0', borderRadius: 16, justifyContent: 'center', alignItems: 'center', width: 32 },

  floatingFooter: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  createBtn: {
      backgroundColor: '#1A1A1A', paddingVertical: 18, borderRadius: 24,
      flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
      shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10
  },
  createBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default CreateTripScreen;