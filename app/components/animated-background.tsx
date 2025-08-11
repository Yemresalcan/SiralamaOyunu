import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { gradients } from '../theme/tokens';

const { width, height } = Dimensions.get('window');

export interface AnimatedBackgroundProps {
  children?: React.ReactNode;
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 8000, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 8000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradients.sky} style={StyleSheet.absoluteFill} />
      <Animated.View
        pointerEvents="none"
        style={[styles.bokehLayer, { transform: [{ translateY }, { translateX }] }]}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={[styles.circle, { left: (i * 97) % width, top: (i * 71) % height, opacity: 0.15 }]} />
        ))}
      </Animated.View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bokehLayer: { ...StyleSheet.absoluteFillObject },
  circle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'white',
    transform: [{ scale: 1 }],
  },
});


