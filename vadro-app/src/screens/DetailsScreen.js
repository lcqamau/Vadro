import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, ActivityIndicator, FlatList, Alert, Modal, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../api/client'; // Ton client sécurisé
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../context/FavoritesContext';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.55;

// --- HELPER : Icônes ---
const getStepIcon = (type) => {
  switch (type) {
    case 'sleep': return 'bed';
    case 'eat': return 'silverware-fork-knife';
    case 'activity': return 'hiking';
    case 'spot': return 'camera';
    case 'start': return 'flag-checkered';
    case 'end': return 'home';
    default: return 'map-marker';
  }
};

// --- HELPER : Groupement ---
const groupStepsByDay = (steps) => {
  if (!steps || steps.length === 0) return [];
  
  const grouped = steps.reduce((acc, step) => {
    if (!acc[step.day]) acc[step.day] = [];
    acc[step.day].push(step);
    return acc;
  }, {});

  return Object.keys(grouped)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(day => ({
      day: parseInt(day),
      steps: grouped[day]
    }));
};

const TripDetailsScreen = ({ route, navigation }) => {
  const { trip, isOwner } = route.params;

  // --- ÉTATS ---
  const [steps, setSteps] = useState([]); 
  const [loadingSteps, setLoadingSteps] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  // --- AVIS ---
  const [reviews, setReviews] = useState([]);
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // GESTION FAVORIS GLOBAL (Seulement si pas propriétaire)
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();
  const isFavorite = !isOwner && checkIsFavorite(trip.id);
  
  // CHARGEMENT AVIS
  useEffect(() => {
    const fetchReviews = async () => {
        try {
            const res = await client.get(`/trips/${trip.id}/reviews`);
            setReviews(res.data);
        } catch (err) {
            console.log("No reviews yet", err);
        }
    };
    fetchReviews();
  }, [trip.id]);

  const handlePostReview = async () => {
      try {
          const res = await client.post(`/trips/${trip.id}/reviews`, {
              rating: reviewRating,
              comment: reviewComment
          });
          setReviews([res.data, ...reviews]);
          setReviewModalVisible(false);
          setReviewComment('');
          Alert.alert("Merci !", "Votre avis a été publié.");
      } catch (err) {
          Alert.alert("Erreur", "Impossible de publier l'avis (probablement déjà fait).");
      }
  };
  
  // Gestion des images
  const images = (trip.images && trip.images.length > 0) 
    ? trip.images 
    : [trip.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1'];

  // ... (useEffect fetchSteps unchanged)

  const handleDeleteTrip = () => {
      Alert.alert(
          "Supprimer ce voyage ?",
          "Cette action est irréversible.",
          [
              { text: "Annuler", style: "cancel" },
              { 
                  text: "Supprimer", 
                  style: "destructive",
                  onPress: async () => {
                      try {
                          await client.delete(`/trips/${trip.id}`);
                          navigation.goBack();
                      } catch (err) {
                          Alert.alert("Erreur", "Impossible de supprimer le voyage.");
                      }
                  }
              }
          ]
      );
  };
  
  const handleEditTrip = () => {
      // Pour l'instant, on redirige vers le remixeur en mode "Nouveau Remix" 
      // car l'édition directe (PUT) n'est pas encore câblée dans GeneratedTripScreen.
      // On peut proposer de "Remixer" comme méthode d'édition pour l'instant.
      handleRemixTrip();
  };

  // ... (handleRemixTrip unchanged)

  // --- 2. CHARGEMENT DES ÉTAPES ---
  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const response = await client.get(`/trips/${trip.id}/steps`);
        setSteps(response.data);
      } catch (err) {
        console.error("Erreur chargement steps:", err);
      } finally {
        setLoadingSteps(false);
      }
    };
    fetchSteps();
  }, [trip.id]);

  // --- 3. FONCTION TOGGLE LIKE ---
  const handleToggleFavorite = () => {
    toggleFavorite(trip.id);
  };

  // --- 4. FONCTION REMIX VOYAGE ---
  const handleRemixTrip = () => {
    Alert.alert(
      "Remixer ce voyage ?",
      "Vous allez être redirigé vers l'éditeur pour personnaliser ce voyage à votre goût.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "C'est parti !", 
          onPress: () => {
             // 1. On formate les données pour l'écran "GeneratedTrip"
             // Il attend une structure : { destination, image, days: [{ day: 1, activities: [...] }] }
             
             // On groupe les étapes par jour si ce n'est pas déjà fait
             const stepsByDay = groupStepsByDay(steps);
             
             const remixData = {
                 destination: `${trip.title} (Remix)`,
                 image: trip.imageUrl,
                 days: stepsByDay.map(group => ({
                     day: group.day,
                     activities: group.steps.map(s => ({
                         title: s.title || s.name || "Activité",
                         desc: s.description || "",
                         image: s.imageUrl || null
                     }))
                 }))
             };

             // 2. Navigation vers l'éditeur
             navigation.navigate('GeneratedTrip', {
                 aiData: remixData,
                 vibes: trip.tags || [],
                 days: trip.durationDays,
                 travelers: 1, // Par défaut
                 budget: { label: `${trip.budgetEuro}€` },
                 // On passe l'ID original pour lier le remix
                 originalTripId: trip.id
             });
          }
        }
      ]
    );
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveSlide(viewableItems[0].index || 0);
    }
  }, []);

  const groupedSteps = groupStepsByDay(steps);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* --- HEADER & NAVIGATION --- */}
      <SafeAreaView style={styles.headerButtons}>
        <TouchableOpacity style={styles.glassButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={{flexDirection: 'row', gap: 10}}>
            <TouchableOpacity style={styles.glassButton}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
            
            {/* ACTIONS PROPRIÉTAIRE OU FAVORIS */}
            {isOwner ? (
                <View style={{flexDirection: 'row', gap: 10}}>
                    <TouchableOpacity 
                      style={[styles.glassButton, {backgroundColor: 'rgba(255,59,48,0.2)', borderColor: 'rgba(255,59,48,0.5)'}]} 
                      onPress={handleDeleteTrip}
                    >
                      <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.glassButton} 
                      onPress={handleEditTrip}
                    >
                      <Ionicons name="pencil" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity 
                  style={styles.glassButton} 
                  onPress={handleToggleFavorite}
                  activeOpacity={0.7}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                  <Ionicons 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    size={24} 
                    color={isFavorite ? "#FF3B30" : "#fff"} 
                  />
                </TouchableOpacity>
            )}
        </View>
      </SafeAreaView>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        bounces={false}
      >
        
        {/* --- CAROUSEL --- */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image 
                source={{ uri: item }} 
                style={styles.headerImage} 
                contentFit="cover"
                transition={300}
              />
            )}
          />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.gradientOverlay} />

          {/* Pagination */}
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === activeSlide ? styles.dotActive : styles.dotInactive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* --- SHEET CONTENU --- */}
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />

          <View style={styles.headerInfo}>
            <View style={styles.topMeta}>
                <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{trip.tags?.[0] || 'VOYAGE'}</Text>
                </View>
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="#1A1A1A" />
                    <Text style={styles.ratingText}>4.9 (12 avis)</Text>
                </View>
            </View>

            <Text style={styles.title}>{trip.title}</Text>
            
            <TouchableOpacity style={styles.authorRow} onPress={() => {
                if (trip.author) {
                    navigation.push('UserProfile', { user: trip.author });
                }
            }}>
                <Image 
                    source={{ uri: trip.author?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' }} 
                    style={styles.authorAvatar} 
                />
                <View>
                    <Text style={styles.authorLabel}>Créé par</Text>
                    <Text style={styles.authorName}>{trip.author?.username || "Anonyme"}</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.statsGrid}>
               <View style={styles.statItem}>
                 <View style={[styles.statIconBox, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="time" size={20} color="#00D668" />
                 </View>
                 <Text style={styles.statLabel}>Durée</Text>
                 <Text style={styles.statValue}>{trip.durationDays} Jours</Text>
               </View>
               <View style={[styles.verticalDivider]} />
               <View style={styles.statItem}>
                 <View style={[styles.statIconBox, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="wallet" size={20} color="#2196F3" />
                 </View>
                 <Text style={styles.statLabel}>Budget</Text>
                 <Text style={styles.statValue}>{trip.budgetEuro} €</Text>
               </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>L'Expérience</Text>
          <Text style={styles.description}>
            {trip.description || "Préparez-vous pour une aventure inoubliable à travers des paysages époustouflants et une culture riche."}
          </Text>

          <Text style={styles.sectionTitle}>Votre Itinéraire</Text>

          {loadingSteps ? (
            <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
          ) : steps.length > 0 ? (
            <View style={styles.timelineContainer}>
              {groupedSteps.map((group, groupIndex) => (
                <View key={groupIndex} style={styles.daySection}>
                  <View style={styles.leftColumn}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayText}>J{group.day}</Text>
                    </View>
                    {groupIndex !== groupedSteps.length - 1 && <View style={styles.verticalLine} />}
                  </View>

                  <View style={styles.rightColumn}>
                    {group.steps.map((step, stepIndex) => (
                      <View key={stepIndex} style={styles.stepCardWrapper}>
                        <View style={styles.visualCard}>
                          {step.imageUrl ? (
                             <Image source={{ uri: step.imageUrl }} style={styles.cardImage} contentFit="cover" />
                          ) : (
                             <View style={[styles.cardImage, { backgroundColor: '#F0F0F0' }]} />
                          )}
                          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardOverlay} />
                          <View style={styles.cardContent}>
                             <View style={styles.cardHeader}>
                               <View style={styles.iconBadge}>
                                 <MaterialCommunityIcons name={getStepIcon(step.type)} size={14} color="#000" />
                               </View>
                               <Text style={styles.stepType}>{step.type?.toUpperCase()}</Text>
                             </View>
                             <Text style={styles.stepTitle}>{step.title}</Text>
                          </View>
                        </View>
                        <Text style={styles.stepDesc}>{step.description}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
// ... (Après la liste des étapes)
          ) : (
            <Text style={styles.emptyText}>Aucune étape pour ce voyage.</Text>
          )}

           {/* --- AVIS --- */}
         <View style={{marginTop: 40, paddingBottom: 20}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:15}}>
                <Text style={styles.sectionTitle}>Avis & Notes ({reviews.length})</Text>
                {!isOwner && (
                    <TouchableOpacity onPress={() => setReviewModalVisible(true)}>
                        <Text style={{color:'#00D668', fontWeight:'bold'}}>Laisser un avis</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            {reviews.map((review) => (
                <View key={review.id} style={{marginBottom: 15, backgroundColor:'#F9F9F9', padding:15, borderRadius:15}}>
                    <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:5}}>
                        <Text style={{fontWeight:'bold'}}>{review.user?.username || 'Voyageur'}</Text>
                        <View style={{flexDirection:'row'}}>{[...Array(review.rating)].map((_,i)=><Ionicons key={i} name="star" size={12} color="#F4C430"/>)}</View>
                    </View>
                    <Text style={{color:'#444'}}>{review.comment}</Text>
                    <Text style={{color:'#999', fontSize:10, marginTop:5}}>{new Date(review.createdAt).toLocaleDateString()}</Text>
                </View>
            ))}
            
            {reviews.length === 0 && (
                <Text style={{color:'#999', fontStyle:'italic'}}>Soyez le premier à donner votre avis !</Text>
            )}
         </View>

        </View>
      </ScrollView>

      {/* MODAL AVIS */}
      <Modal visible={isReviewModalVisible} animationType="slide" transparent>
          <View style={{flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.5)'}}>
              <View style={{backgroundColor:'#fff', padding:20, borderTopLeftRadius:20, borderTopRightRadius:20}}>
                  <Text style={styles.sectionTitle}>Votre avis</Text>
                  
                  <View style={{flexDirection:'row', marginBottom:20, justifyContent:'center', gap:10}}>
                      {[1,2,3,4,5].map(star => (
                          <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                              <Ionicons name={star <= reviewRating ? "star" : "star-outline"} size={32} color="#F4C430" />
                          </TouchableOpacity>
                      ))}
                  </View>
                  
                  <TextInput 
                      style={{backgroundColor:'#F0F0F0', padding:15, borderRadius:10, height:100, textAlignVertical:'top', marginBottom:20}}
                      placeholder="Racontez votre expérience..."
                      multiline
                      value={reviewComment}
                      onChangeText={setReviewComment}
                  />
                  
                  <TouchableOpacity onPress={handlePostReview} style={{backgroundColor:'#00D668', padding:15, borderRadius:15, alignItems:'center', marginBottom:10}}>
                      <Text style={{color:'#fff', fontWeight:'bold'}}>Publier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setReviewModalVisible(false)} style={{padding:15, alignItems:'center'}}>
                      <Text style={{color:'#666'}}>Annuler</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

      {/* --- BOTTOM BAR --- */}
      <View style={styles.bottomBarWrapper}>
          <View style={styles.bottomBarGlass}>
            <View>
            <Text style={styles.priceLabel}>Prix total estimé</Text>
            <View style={{flexDirection:'row', alignItems:'baseline'}}>
                <Text style={styles.totalPrice}>{trip.budgetEuro}€</Text>
                <Text style={{color:'#666', fontSize:12}}> / pers</Text>
            </View>
            </View>
            
            <TouchableOpacity 
                style={styles.bookButton} 
                onPress={isOwner ? handleEditTrip : handleRemixTrip}
            >
                <Text style={styles.bookButtonText}>{isOwner ? "Modifier ce voyage" : "Remixer ce voyage"}</Text>
                <Ionicons name={isOwner ? "pencil" : "copy-outline"} size={20} color="#fff" />
            </TouchableOpacity>

          </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  carouselContainer: { height: HEADER_HEIGHT, width: width },
  headerImage: { width: width, height: HEADER_HEIGHT, backgroundColor: '#000' },
  gradientOverlay: { position: 'absolute', bottom: 0, width: '100%', height: 100 },
  
  pagination: {
    position: 'absolute', bottom: 40, width: '100%',
    flexDirection: 'row', justifyContent: 'center', gap: 8
  },
  dot: { borderRadius: 4, height: 6 },
  dotActive: { width: 20, backgroundColor: '#fff' },
  dotInactive: { width: 6, backgroundColor: 'rgba(255,255,255,0.5)' },

  headerButtons: { 
    position: 'absolute', top: 0, width: '100%', 
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 50, paddingTop: 10
  },
  glassButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)'
  },

  sheetContainer: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 32, borderTopRightRadius: 32, 
    marginTop: -30,
    minHeight: height * 0.6, padding: 25,
    paddingBottom: 50
  },
  dragHandle: { 
    width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 25 
  },

  topMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tagBadge: { backgroundColor: '#000', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  ratingText: { fontWeight: '600', fontSize: 12 },

  title: { fontSize: 28, fontWeight: '900', color: '#1A1A1A', marginBottom: 15, letterSpacing: -0.5, lineHeight: 32 },

  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  authorAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  authorLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase', fontWeight: 'bold' },
  authorName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },

  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FAFAFA', padding: 15, borderRadius: 16 },
  statItem: { alignItems: 'center', flex: 1 },
  statIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  verticalDivider: { width: 1, height: 40, backgroundColor: '#E0E0E0' },

  sectionTitle: { fontSize: 22, fontWeight: '800', marginBottom: 15, marginTop: 30, color: '#1A1A1A' },
  description: { fontSize: 16, color: '#555', lineHeight: 26 },

  timelineContainer: { paddingLeft: 0 },
  daySection: { flexDirection: 'row', marginBottom: 0 },
  leftColumn: { width: 40, alignItems: 'center', marginRight: 15 },
  dayBadge: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center', zIndex: 10, marginBottom: 5,
    borderWidth: 2, borderColor: '#fff'
  },
  dayText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  verticalLine: { width: 2, flex: 1, backgroundColor: '#E5E5EA', marginBottom: -10 },
  
  rightColumn: { flex: 1, paddingBottom: 30 },
  stepCardWrapper: { marginBottom: 20 },
  visualCard: {
    height: 160, borderRadius: 20, overflow: 'hidden', 
    backgroundColor: '#F0F0F0', marginBottom: 10, justifyContent: 'flex-end',
    shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, elevation: 5
  },
  cardImage: { ...StyleSheet.absoluteFillObject },
  cardOverlay: { ...StyleSheet.absoluteFillObject },
  cardContent: { padding: 15 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  iconBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  stepType: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '800' },
  stepTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 4 },
  stepDesc: { fontSize: 14, color: '#666', lineHeight: 20 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' },

  bottomBarWrapper: {
    position: 'absolute', bottom: 0, width: '100%',
    paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10,
  },
  bottomBarGlass: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 15, borderRadius: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
    borderWidth: 1, borderColor: '#F5F5F5'
  },
  priceLabel: { fontSize: 10, color: '#888', fontWeight: '600', textTransform: 'uppercase' },
  totalPrice: { fontSize: 24, fontWeight: '900', color: '#1A1A1A' },
  bookButton: { 
    backgroundColor: '#1A1A1A', paddingHorizontal: 25, paddingVertical: 14, borderRadius: 18, 
    flexDirection: 'row', alignItems: 'center', gap: 8 
  },
  bookButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default TripDetailsScreen;