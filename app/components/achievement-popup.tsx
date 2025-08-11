import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Achievement } from '../services/achievement-service';
import { gradients, radius, shadow } from '../theme/tokens';

const { width } = Dimensions.get('window');

interface AchievementPopupProps {
  achievement: Achievement | null;
  visible: boolean;
  onClose: () => void;
}

export function AchievementPopup({ achievement, visible, onClose }: AchievementPopupProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && achievement) {
      // Popup animasyonu
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1.1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      // Glow animasyonu
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Otomatik kapanma
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0);
      bounceAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [visible, achievement]);

  const handleClose = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  if (!achievement) return null;

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 0.8)'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.glowContainer,
              {
                shadowColor: glowColor,
                shadowOpacity: glowAnim,
              },
            ]}
          >
            <LinearGradient
              colors={gradients.gold}
              style={styles.popup}
            >
              {/* Konfeti efekti */}
              <View style={styles.confettiContainer}>
                {[...Array(12)].map((_, i) => (
                  <Animated.Text
                    key={i}
                    style={[
                      styles.confetti,
                      {
                        left: Math.random() * (width - 100),
                        animationDelay: `${Math.random() * 2}s`,
                        transform: [{ scale: bounceAnim }],
                      },
                    ]}
                  >
                    {['🎉', '⭐', '🎊', '✨', '🏆'][Math.floor(Math.random() * 5)]}
                  </Animated.Text>
                ))}
              </View>

              <View style={styles.content}>
                {/* Başlık */}
                <Text style={styles.title}>🎉 BAŞARI AÇILDI! 🎉</Text>

                {/* İkon */}
                <Animated.View
                  style={[
                    styles.iconContainer,
                    {
                      transform: [{ scale: bounceAnim }],
                    },
                  ]}
                >
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>✅</Text>
                  </View>
                </Animated.View>

                {/* Başarı bilgileri */}
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>

                {/* Ödül */}
                <View style={styles.rewardContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.rewardBox}
                  >
                    <Text style={styles.rewardText}>
                      🏆 +{achievement.reward.points} Puan
                    </Text>
                    <Text style={styles.badgeText}>
                      {achievement.reward.badge} Rozet Kazandın!
                    </Text>
                  </LinearGradient>
                </View>

                {/* Kapatma butonu */}
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                    style={styles.closeButtonGradient}
                  >
                    <Text style={styles.closeButtonText}>Devam Et</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 350,
  },
  glowContainer: {
    borderRadius: radius.xl,
    ...shadow.glow,
    shadowRadius: 20,
    elevation: 20,
  },
  popup: {
    borderRadius: radius.xl,
    padding: 30,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1,
  },
  confetti: {
    position: 'absolute',
    fontSize: 20,
    opacity: 0.8,
  },
  content: {
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  achievementIcon: {
    fontSize: 80,
    textAlign: 'center',
  },
  completedBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadgeText: {
    fontSize: 16,
  },
  achievementTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  achievementDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  rewardContainer: {
    width: '100%',
    marginBottom: 25,
  },
  rewardBox: {
    padding: 15,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  rewardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  badgeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: radius.lg,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
