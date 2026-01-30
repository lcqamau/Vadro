import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Animated, Dimensions, Text } from 'react-native';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;

const SwipeDeck = ({ data, renderCard, onSwipeRight, onSwipeLeft }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  // --- GESTION DES GESTES ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  // --- ANIMATIONS ---
  const forceSwipe = (direction) => {
    const x = direction === 'right' ? width + 100 : -width - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction) => {
    const item = data[currentIndex];
    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prev) => prev + 1);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false,
    }).start();
  };

  // --- INTERPOLATIONS (Le coeur de l'effet visuel) ---
  
  // 1. Rotation de la carte
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  // 2. Opacité du "OUI" (Apparaît quand x > 0)
  const likeOpacity = position.x.interpolate({
    inputRange: [10, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // 3. Opacité du "NON" (Apparaît quand x < 0)
  const nopeOpacity = position.x.interpolate({
    inputRange: [-width / 4, -10],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Style complet de la carte active
  const activeCardStyle = {
    transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
  };

  if (currentIndex >= data.length) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#8E8E93' }}>Plus de voyages disponibles !</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* --- CARTE SUIVANTE (En dessous, statique) --- */}
      {data[currentIndex + 1] && (
        <View style={[styles.cardStyle, styles.nextCard]}>
          {renderCard(data[currentIndex + 1])}
        </View>
      )}
      
      {/* --- CARTE ACTIVE (Au dessus, animée) --- */}
      <Animated.View
        style={[styles.cardStyle, activeCardStyle]}
        {...panResponder.panHandlers}
      >
        {/* Contenu de la carte */}
        {renderCard(data[currentIndex])}

        {/* --- LABEL "OUI" (Vert) --- */}
        <Animated.View style={[styles.labelContainer, styles.likeLabel, { opacity: likeOpacity }]}>
          <Text style={styles.likeText}>YES</Text>
        </Animated.View>

        {/* --- LABEL "NON" (Rouge) --- */}
        <Animated.View style={[styles.labelContainer, styles.nopeLabel, { opacity: nopeOpacity }]}>
          <Text style={styles.nopeText}>NO</Text>
        </Animated.View>

      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', marginTop: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Positionnement des cartes
  cardStyle: {
    position: 'absolute',
    width: width,
    alignItems: 'center', // Centre la TripCard horizontalement
  },
  nextCard: {
    top: 12, // Légèrement décalée vers le bas
    transform: [{ scale: 0.95 }], // Plus petite
    opacity: 0.6,
    zIndex: -1,
  },

  // --- STYLES DES LABELS (OUI / NON) ---
  labelContainer: {
    position: 'absolute',
    top: 40,
    zIndex: 999, // Au dessus de l'image
    borderWidth: 4,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  
  // STYLE "OUI"
  likeLabel: {
    left: 40,
    borderColor: '#00D668', // Vert Virote
    transform: [{ rotate: '-15deg' }],
  },
  likeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#00D668',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // STYLE "NON"
  nopeLabel: {
    right: 40,
    borderColor: '#FF3B30', // Rouge
    transform: [{ rotate: '15deg' }],
  },
  nopeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FF3B30',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default SwipeDeck;