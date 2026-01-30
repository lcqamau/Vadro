import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generateTrip } from '../utils/TripGenerator'; 

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

  // --- LOGIQUE IA ---
  const toggleVibe = (id) => {
    if (selectedVibes.includes(id)) {
      setSelectedVibes(selectedVibes.filter(v => v !== id));
    } else {
      if (selectedVibes.length < 3) setSelectedVibes([...selectedVibes, id]);
    }
  };

  const handleNextIA = () => {
    if (step < STEPS_IA.length) {
      setStep(step + 1);
    } else {
      // FIN DU QUIZ -> GÉNÉRATION
      setIsGenerating(true);
      setTimeout(() => {
        const safeBudget = selectedBudget || { id: 'standard', label: 'Standard' };
        const generatedData = generateTrip(selectedVibes, days, travelers, safeBudget);
        
        setIsGenerating(false);
        navigation.replace('GeneratedTrip', {
          aiData: generatedData,
          vibes: selectedVibes,
          days: days,
          travelers: travelers,
          budget: safeBudget
        });
      }, 1500);
    }
  };

  // --- LOGIQUE MANUELLE ---
  const handleCreateManual = () => {
    if (manualDest.trim() === '') {
      alert("Il faut au moins un nom de destination !");
      return;
    }

    setIsGenerating(true);
    // On simule une création rapide
    setTimeout(() => {
      // On crée un objet "Voyage Vide"
      const blankTrip = {
        destination: manualDest,
        // Image par défaut (Carte du monde)
        image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1', 
        priceEstimate: 'À définir',
        destinationId: 'manual',
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
        budget: { label: 'Perso' }
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
      <Text style={styles.stepTitle}>À toi de jouer ✍️</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Où veux-tu aller ?</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Roadtrip en Italie..." 
          value={manualDest}
          onChangeText={setManualDest}
          autoFocus
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Combien de jours ?</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setManualDays(Math.max(1, manualDays - 1))} style={styles.roundBtn}>
            <Ionicons name="remove" size={24} />
          </TouchableOpacity>
          <Text style={styles.bigNumber}>{manualDays} j</Text>
          <TouchableOpacity onPress={() => setManualDays(manualDays + 1)} style={styles.roundBtn}>
            <Ionicons name="add" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{flex:1}} /> 
      
      <TouchableOpacity style={styles.nextBtn} onPress={handleCreateManual}>
        <Text style={styles.nextText}>Créer mon voyage</Text>
      </TouchableOpacity>
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
});

export default CreateTripScreen;