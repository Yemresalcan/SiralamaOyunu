import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedBackground } from '../components/animated-background';
import leaderboardService, { LeaderboardEntry } from '../services/leaderboard-service';
import { glassmorphism, gradients, radius, shadow } from '../theme/tokens';

const { width, height } = Dimensions.get('window');

interface LeaderboardScreenProps {
  onClose: () => void;
  currentUsername?: string;
}

export function LeaderboardScreen({ onClose, currentUsername }: LeaderboardScreenProps) {
  const colorScheme = useColorScheme();
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<number>(0);
  const [userHighScore, setUserHighScore] = useState<number>(0);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const topScores = await leaderboardService.getTopScores(100);
      setScores(topScores);

      // Kullanıcının verilerini al
      if (currentUsername) {
        const highScore = await leaderboardService.getUserHighScore(currentUsername);
        setUserHighScore(highScore);
        
        if (highScore > 0) {
          const rank = await leaderboardService.getUserRank(currentUsername, highScore);
          setUserRank(rank);
        }
      }
    } catch (error) {
      console.error('Leaderboard yüklenemedi:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadLeaderboard();
  };

  const getRankEmoji = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContainer}>
        <BlurView intensity={30} style={styles.headerBlur}>
          <LinearGradient
            colors={gradients.gold}
            style={styles.headerGradient}
          >
            <View style={styles.glassShine} />
            <Text style={styles.headerTitle}>🏆 Lider Tablosu 🏆</Text>
            
            {currentUsername && userHighScore > 0 && (
              <View style={styles.userStatsContainer}>
                <View style={styles.userStatBox}>
                  <Text style={styles.userStatLabel}>Sıralama</Text>
                  <Text style={styles.userStatValue}>
                    {getRankEmoji(userRank)} #{userRank}
                  </Text>
                </View>
                <View style={styles.userStatBox}>
                  <Text style={styles.userStatLabel}>En Yüksek</Text>
                  <Text style={styles.userStatValue}>⭐ {userHighScore}</Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </BlurView>
      </View>
    </View>
  );

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const rank = index + 1;
    const isCurrentUser = item.username === currentUsername;
    const isTopThree = rank <= 3;

    const getItemColors = () => {
      if (isTopThree) {
        return ['rgba(255, 215, 0, 0.8)', 'rgba(255, 165, 0, 0.4)'];
      }
      if (isCurrentUser) {
        return ['rgba(52, 152, 219, 0.7)', 'rgba(52, 152, 219, 0.3)'];
      }
      return ['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.2)'];
    };

    return (
      <View style={styles.scoreItemContainer}>
        <BlurView intensity={15} style={styles.scoreItemBlur}>
          <LinearGradient
            colors={getItemColors()}
            style={[
              styles.scoreItem,
              isCurrentUser && styles.currentUserItem,
              isTopThree && styles.topThreeItem
            ]}
          >
            <View style={styles.rankContainer}>
              <Text style={[styles.rankText, isTopThree && styles.topThreeRank]}>
                {rank <= 3 ? getRankEmoji(rank) : `#${rank}`}
              </Text>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={[
                styles.username,
                isCurrentUser && styles.currentUsername,
                isTopThree && styles.topThreeUsername
              ]}>
                {item.username}
                {isCurrentUser && ' (Sen)'}
              </Text>
            </View>
            
            <View style={styles.scoreContainer}>
              <Text style={[
                styles.score,
                isTopThree && styles.topThreeScore
              ]}>
                {item.score}
              </Text>
            </View>
          </LinearGradient>
        </BlurView>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📊</Text>
      <Text style={styles.emptyText}>Henüz skor kaydı yok</Text>
      <Text style={styles.emptySubtext}>İlk skoru sen gönder!</Text>
    </View>
  );

  const gradientColors = gradients.sky;

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButtonContainer}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <BlurView intensity={20} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : (
          <FlatList
            data={scores}
            renderItem={renderItem}
            keyExtractor={(item) => item.id || `${item.username}_${item.score}`}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={[styles.listContent, { paddingBottom: 32 }]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="white"
                colors={['#4A90E2']}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...shadow.glass,
  },
  closeButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    ...glassmorphism.button,
    borderRadius: 22,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 20,
  },
  headerContainer: {
    marginHorizontal: 15,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.glow,
    shadowColor: '#FFD700',
  },
  headerBlur: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...glassmorphism.card,
  },
  headerGradient: {
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: radius.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  userStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  userStatBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  userStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  userStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  listContent: {
    paddingBottom: 30,
  },
  scoreItemContainer: {
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  scoreItemBlur: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...glassmorphism.card,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: radius.lg,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: 'rgba(52, 152, 219, 0.8)',
    shadowColor: '#3498DB',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  topThreeItem: {
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.8)',
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  topThreeRank: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
    paddingHorizontal: 15,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  currentUsername: {
    color: '#87CEEB',
    fontWeight: 'bold',
  },
  topThreeUsername: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  scoreContainer: {
    minWidth: 70,
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  topThreeScore: {
    color: '#FFD700',
    fontSize: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
