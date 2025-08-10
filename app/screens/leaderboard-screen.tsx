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
import leaderboardService, { LeaderboardEntry } from '../services/leaderboard-service';

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
      <LinearGradient
        colors={['#FFD700', '#FFA500', '#FF8C00']}
        style={styles.headerGradient}
      >
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
    </View>
  );

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const rank = index + 1;
    const isCurrentUser = item.username === currentUsername;
    const isTopThree = rank <= 3;

    return (
      <View style={[
        styles.scoreItem,
        isCurrentUser && styles.currentUserItem,
        isTopThree && styles.topThreeItem
      ]}>
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

  const gradientColors = ['#87CEEB', '#98D8E8', '#B0E0E6'] as const;

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>✕</Text>
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
    </LinearGradient>
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
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserItem: {
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    borderWidth: 2,
    borderColor: '#3498DB',
  },
  topThreeItem: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
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
    color: '#2C3E50',
  },
  currentUsername: {
    color: '#3498DB',
    fontWeight: 'bold',
  },
  topThreeUsername: {
    color: '#F39C12',
    fontWeight: 'bold',
  },
  scoreContainer: {
    minWidth: 70,
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  topThreeScore: {
    color: '#F39C12',
    fontSize: 22,
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
