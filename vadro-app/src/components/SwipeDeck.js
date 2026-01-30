// src/components/SwipeDeck.js
import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width;

const SwipeDeck = ({ data, renderCard, onSwipeRight, onSwipeLeft }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  // Gestionnaire de gestes (PanResponder)
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

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-width * 1.5, 0, width * 1.5],
      outputRange: ['-30deg', '0deg', '30deg'],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  if (currentIndex >= data.length) {
    return <View style={styles.center} />;
  }

  return (
    <View style={styles.container}>
      {/* Carte suivante (en dessous) */}
      {data[currentIndex + 1] && (
        <View style={[styles.cardStyle, styles.nextCard]}>
          {renderCard(data[currentIndex + 1])}
        </View>
      )}
      
      {/* Carte actuelle (animée) */}
      <Animated.View
        style={[getCardStyle(), styles.cardStyle]}
        {...panResponder.panHandlers}
      >
        {renderCard(data[currentIndex])}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', marginTop: 20 },
  cardStyle: { position: 'absolute', width: width, alignItems: 'center' },
  nextCard: { top: 10, transform: [{ scale: 0.95 }], opacity: 0.8, zIndex: -1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default SwipeDeck;