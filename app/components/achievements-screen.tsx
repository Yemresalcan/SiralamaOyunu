import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import achievementService, { Achievement, UserStats } from '../services/achievement-service';
import { glassmorphism, gradients, radius, shadow } from '../theme/tokens';
import { AnimatedBackground } from './animated-background';

const { width } = Dimensions.get('window');

interface AchievementsScreenProps {
  onClose: () => void;
}

type TabType = 'weekly' | 'monthly' | 'general';

export function AchievementsScreen({ onClose }: AchievementsScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('weekly');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (stats) {
      loadAchievements();
    }
  }, [activeTab, stats]);

  const loadData = async () => {
    try {
      const userStats = await achievementService.getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Başarılar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async () => {
    if (!stats) return;
    
    const achievementsByType = await achievementService.getAchievementsByType(activeTab);
    setAchievements(achievementsByType);
  };

  const getTabTitle = (tab: TabType): string => {
    switch (tab) {
      case 'weekly': return 'Haftalık';
      case 'monthly': return 'Aylık';
      case 'general': return 'Genel';
    }
  };

  const getProgressPercentage = (achievement: Achievement): number => {
    if (achievement.completed) return 100;
    if (achievement.category === 'speed' && achievement.current > 0) {
      return Math.min((achievement.target / achievement.current) * 100, 100);
    }
    return Math.min((achievement.current / achievement.target) * 100, 100);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={gradients.gold}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>🏆 Başarılar 🏆</Text>
        
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Toplam Puan</Text>
              <Text style={styles.statValue}>{stats.totalAchievementPoints}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Rozet Sayısı</Text>
              <Text style={styles.statValue}>{stats.unlockedBadges.length}</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {(['weekly', 'monthly', 'general'] as TabType[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
                     <LinearGradient
             colors={activeTab === tab ? ['rgba(74,144,226,0.8)', 'rgba(30,144,255,0.6)'] : ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.2)']}
             style={styles.tabGradient}
           >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {getTabTitle(tab)}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAchievementItem = ({ item }: { item: Achievement }) => {
    const progress = getProgressPercentage(item);
    const isCompleted = item.completed;

         return (
       <View style={[styles.achievementCard, isCompleted && styles.completedCard]}>
         <LinearGradient
           colors={isCompleted ? ['rgba(255,215,0,0.9)', 'rgba(255,165,0,0.7)'] : ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)']}
           style={styles.cardGradient}
         >
          <View style={styles.cardContent}>
            <View style={styles.achievementIcon}>
              <Text style={styles.iconText}>{item.icon}</Text>
              {isCompleted && <Text style={styles.completedBadge}>✅</Text>}
            </View>
            
            <View style={styles.achievementInfo}>
              <Text style={[styles.achievementTitle, isCompleted && styles.completedTitle]}>
                {item.title}
              </Text>
              <Text style={styles.achievementDescription}>
                {item.description}
              </Text>
              
              <View style={styles.progressContainer}>
                                 <View style={styles.progressBar}>
                   <LinearGradient
                     colors={isCompleted ? ['#4CAF50', '#66BB6A'] : ['#2196F3', '#64B5F6']}
                     style={[styles.progressFill, { width: `${progress}%` }]}
                   />
                 </View>
                <Text style={styles.progressText}>
                  {item.category === 'speed' && item.current > 0
                    ? `${item.current}s / ${item.target}s`
                    : `${item.current} / ${item.target}`
                  }
                </Text>
              </View>
              
              <View style={styles.rewardContainer}>
                <Text style={styles.rewardText}>
                  🏆 {item.reward.points} puan • {item.reward.badge} rozet
                </Text>
                {isCompleted && item.completedAt && (
                  <Text style={styles.completedDate}>
                    ✨ {new Date(item.completedAt).toLocaleDateString('tr-TR')}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🎯</Text>
      <Text style={styles.emptyText}>Henüz başarı yok</Text>
      <Text style={styles.emptySubtext}>
        {activeTab === 'weekly' ? 'Bu hafta' : 
         activeTab === 'monthly' ? 'Bu ay' : 'Genel'} başarıları açmak için oyna!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <AnimatedBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Başarılar yükleniyor...</Text>
          </View>
        </SafeAreaView>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderHeader()}
          {renderTabs()}
          
          <FlatList
            data={achievements}
            renderItem={renderAchievementItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
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
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 20,
    borderRadius: radius.lg,
    marginHorizontal: 15,
    alignItems: 'center',
    ...shadow.card,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.md,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
  },
  tabGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    ...glassmorphism.button,
  },
  activeTab: {
    transform: [{ scale: 1.02 }],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  achievementCard: {
    marginBottom: 15,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  completedCard: {
    transform: [{ scale: 1.02 }],
  },
  cardGradient: {
    ...glassmorphism.card,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 15,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  iconText: {
    fontSize: 32,
  },
  completedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  completedTitle: {
    color: '#FFD700',
  },
  achievementDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
  },
  completedDate: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
  emptyContainer: {
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
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
});
