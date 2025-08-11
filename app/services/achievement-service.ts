import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'weekly' | 'monthly' | 'general';
  target: number;
  current: number;
  completed: boolean;
  completedAt?: Date;
  category: 'score' | 'games' | 'streak' | 'speed' | 'accuracy';
  reward: {
    points: number;
    badge: string;
  };
}

export interface UserStats {
  totalGames: number;
  totalScore: number;
  highScore: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  gamesThisWeek: number;
  gamesThisMonth: number;
  scoreThisWeek: number;
  scoreThisMonth: number;
  perfectGames: number;
  fastestGame: number; // saniye
  totalPlayTime: number; // saniye
  lastPlayDate: Date;
  achievements: Achievement[];
  unlockedBadges: string[];
  totalAchievementPoints: number;
}

class AchievementService {
  private readonly STORAGE_KEY = 'user_achievements';
  private readonly STATS_KEY = 'user_stats';

  // Başarı tanımları
  private achievementDefinitions: Omit<Achievement, 'current' | 'completed' | 'completedAt'>[] = [
    // Haftalık Başarılar
    {
      id: 'weekly_games_5',
      title: 'Haftalık Oyuncu',
      description: 'Bu hafta 5 oyun oyna',
      icon: '🎮',
      type: 'weekly',
      target: 5,
      category: 'games',
      reward: { points: 50, badge: '🎮' }
    },
    {
      id: 'weekly_games_15',
      title: 'Haftalık Şampiyon',
      description: 'Bu hafta 15 oyun oyna',
      icon: '🏆',
      type: 'weekly',
      target: 15,
      category: 'games',
      reward: { points: 150, badge: '🏆' }
    },
    {
      id: 'weekly_score_1000',
      title: 'Haftalık Skor Avcısı',
      description: 'Bu hafta toplam 1000 puan kazan',
      icon: '⭐',
      type: 'weekly',
      target: 1000,
      category: 'score',
      reward: { points: 100, badge: '⭐' }
    },
    {
      id: 'weekly_streak_5',
      title: 'Haftalık Seri',
      description: 'Bu hafta 5 oyun üst üste kazan',
      icon: '🔥',
      type: 'weekly',
      target: 5,
      category: 'streak',
      reward: { points: 200, badge: '🔥' }
    },

    // Aylık Başarılar
    {
      id: 'monthly_games_30',
      title: 'Aylık Düzenli',
      description: 'Bu ay 30 oyun oyna',
      icon: '📅',
      type: 'monthly',
      target: 30,
      category: 'games',
      reward: { points: 300, badge: '📅' }
    },
    {
      id: 'monthly_games_100',
      title: 'Aylık Bağımlı',
      description: 'Bu ay 100 oyun oyna',
      icon: '🎯',
      type: 'monthly',
      target: 100,
      category: 'games',
      reward: { points: 1000, badge: '🎯' }
    },
    {
      id: 'monthly_score_10000',
      title: 'Aylık Skor Kralı',
      description: 'Bu ay toplam 10.000 puan kazan',
      icon: '👑',
      type: 'monthly',
      target: 10000,
      category: 'score',
      reward: { points: 500, badge: '👑' }
    },
    {
      id: 'monthly_perfect_10',
      title: 'Aylık Mükemmellik',
      description: 'Bu ay 10 mükemmel oyun oyna',
      icon: '💎',
      type: 'monthly',
      target: 10,
      category: 'accuracy',
      reward: { points: 800, badge: '💎' }
    },

    // Genel Başarılar
    {
      id: 'general_games_100',
      title: 'Yüzlük Kulüp',
      description: 'Toplam 100 oyun oyna',
      icon: '💯',
      type: 'general',
      target: 100,
      category: 'games',
      reward: { points: 500, badge: '💯' }
    },
    {
      id: 'general_games_500',
      title: 'Beş Yüzlük Efsane',
      description: 'Toplam 500 oyun oyna',
      icon: '🌟',
      type: 'general',
      target: 500,
      category: 'games',
      reward: { points: 2000, badge: '🌟' }
    },
    {
      id: 'general_games_1000',
      title: 'Binlik Efsane',
      description: 'Toplam 1000 oyun oyna',
      icon: '🚀',
      type: 'general',
      target: 1000,
      category: 'games',
      reward: { points: 5000, badge: '🚀' }
    },
    {
      id: 'general_high_score_500',
      title: 'Beş Yüzlük Rekor',
      description: '500+ puan yap',
      icon: '🎖️',
      type: 'general',
      target: 500,
      category: 'score',
      reward: { points: 300, badge: '🎖️' }
    },
    {
      id: 'general_high_score_1000',
      title: 'Binlik Rekor',
      description: '1000+ puan yap',
      icon: '🏅',
      type: 'general',
      target: 1000,
      category: 'score',
      reward: { points: 1000, badge: '🏅' }
    },
    {
      id: 'general_streak_10',
      title: 'Onluk Seri',
      description: '10 oyun üst üste kazan',
      icon: '🔥',
      type: 'general',
      target: 10,
      category: 'streak',
      reward: { points: 800, badge: '🔥' }
    },
    {
      id: 'general_streak_25',
      title: 'Yirmi Beşlik Seri',
      description: '25 oyun üst üste kazan',
      icon: '⚡',
      type: 'general',
      target: 25,
      category: 'streak',
      reward: { points: 2000, badge: '⚡' }
    },
    {
      id: 'general_perfect_50',
      title: 'Mükemmellik Ustası',
      description: '50 mükemmel oyun oyna',
      icon: '✨',
      type: 'general',
      target: 50,
      category: 'accuracy',
      reward: { points: 1500, badge: '✨' }
    },
    {
      id: 'general_speed_30',
      title: 'Hız Şeytanı',
      description: '30 saniyede oyun bitir',
      icon: '💨',
      type: 'general',
      target: 30,
      category: 'speed',
      reward: { points: 600, badge: '💨' }
    },
    {
      id: 'general_speed_20',
      title: 'Işık Hızı',
      description: '20 saniyede oyun bitir',
      icon: '⚡',
      type: 'general',
      target: 20,
      category: 'speed',
      reward: { points: 1200, badge: '⚡' }
    }
  ];

  async getUserStats(): Promise<UserStats> {
    try {
      const statsData = await AsyncStorage.getItem(this.STATS_KEY);
      if (statsData) {
        const stats = JSON.parse(statsData);
        return {
          ...stats,
          lastPlayDate: new Date(stats.lastPlayDate),
          achievements: stats.achievements.map((a: any) => ({
            ...a,
            completedAt: a.completedAt ? new Date(a.completedAt) : undefined
          }))
        };
      }
      
      return this.getDefaultStats();
    } catch (error) {
      console.error('Stats yüklenemedi:', error);
      return this.getDefaultStats();
    }
  }

  private getDefaultStats(): UserStats {
    const achievements = this.achievementDefinitions.map(def => ({
      ...def,
      current: 0,
      completed: false
    }));

    return {
      totalGames: 0,
      totalScore: 0,
      highScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageScore: 0,
      gamesThisWeek: 0,
      gamesThisMonth: 0,
      scoreThisWeek: 0,
      scoreThisMonth: 0,
      perfectGames: 0,
      fastestGame: 0,
      totalPlayTime: 0,
      lastPlayDate: new Date(),
      achievements,
      unlockedBadges: [],
      totalAchievementPoints: 0
    };
  }

  async updateGameStats(gameData: {
    score: number;
    gameTime: number;
    isPerfect: boolean;
    won: boolean;
  }): Promise<Achievement[]> {
    const stats = await this.getUserStats();
    const now = new Date();
    
    // Haftalık ve aylık sıfırlama kontrolü
    this.resetPeriodicalAchievements(stats, now);
    
    // İstatistikleri güncelle
    stats.totalGames += 1;
    stats.totalScore += gameData.score;
    stats.totalPlayTime += gameData.gameTime;
    stats.lastPlayDate = now;
    
    if (gameData.score > stats.highScore) {
      stats.highScore = gameData.score;
    }
    
    stats.averageScore = Math.round(stats.totalScore / stats.totalGames);
    
    // Haftalık/aylık istatistikler
    stats.gamesThisWeek += 1;
    stats.gamesThisMonth += 1;
    stats.scoreThisWeek += gameData.score;
    stats.scoreThisMonth += gameData.score;
    
    // Streak hesaplama
    if (gameData.won) {
      stats.currentStreak += 1;
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }
    } else {
      stats.currentStreak = 0;
    }
    
    // Perfect games
    if (gameData.isPerfect) {
      stats.perfectGames += 1;
    }
    
    // En hızlı oyun
    if (stats.fastestGame === 0 || gameData.gameTime < stats.fastestGame) {
      stats.fastestGame = gameData.gameTime;
    }
    
    // Başarıları kontrol et ve güncelle
    const newAchievements = this.checkAchievements(stats);
    
    // Verileri kaydet
    await AsyncStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    
    return newAchievements;
  }

  private resetPeriodicalAchievements(stats: UserStats, now: Date): void {
    const lastPlay = new Date(stats.lastPlayDate);
    const nowWeek = this.getWeekNumber(now);
    const lastWeek = this.getWeekNumber(lastPlay);
    const nowMonth = now.getMonth();
    const lastMonth = lastPlay.getMonth();
    
    // Haftalık sıfırlama
    if (nowWeek !== lastWeek) {
      stats.gamesThisWeek = 0;
      stats.scoreThisWeek = 0;
      // Haftalık başarıları sıfırla
      stats.achievements.forEach(achievement => {
        if (achievement.type === 'weekly') {
          achievement.current = 0;
          achievement.completed = false;
          achievement.completedAt = undefined;
        }
      });
    }
    
    // Aylık sıfırlama
    if (nowMonth !== lastMonth) {
      stats.gamesThisMonth = 0;
      stats.scoreThisMonth = 0;
      // Aylık başarıları sıfırla
      stats.achievements.forEach(achievement => {
        if (achievement.type === 'monthly') {
          achievement.current = 0;
          achievement.completed = false;
          achievement.completedAt = undefined;
        }
      });
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private checkAchievements(stats: UserStats): Achievement[] {
    const newAchievements: Achievement[] = [];
    
    stats.achievements.forEach(achievement => {
      if (achievement.completed) return;
      
      let currentValue = 0;
      
      switch (achievement.category) {
        case 'games':
          if (achievement.type === 'weekly') currentValue = stats.gamesThisWeek;
          else if (achievement.type === 'monthly') currentValue = stats.gamesThisMonth;
          else currentValue = stats.totalGames;
          break;
          
        case 'score':
          if (achievement.id.includes('high_score')) currentValue = stats.highScore;
          else if (achievement.type === 'weekly') currentValue = stats.scoreThisWeek;
          else if (achievement.type === 'monthly') currentValue = stats.scoreThisMonth;
          else currentValue = stats.totalScore;
          break;
          
        case 'streak':
          currentValue = achievement.type === 'general' ? stats.longestStreak : stats.currentStreak;
          break;
          
        case 'speed':
          currentValue = stats.fastestGame;
          break;
          
        case 'accuracy':
          currentValue = stats.perfectGames;
          break;
      }
      
      achievement.current = currentValue;
      
      // Başarı tamamlandı mı?
      if ((achievement.category === 'speed' && currentValue > 0 && currentValue <= achievement.target) ||
          (achievement.category !== 'speed' && currentValue >= achievement.target)) {
        achievement.completed = true;
        achievement.completedAt = new Date();
        stats.totalAchievementPoints += achievement.reward.points;
        
        if (!stats.unlockedBadges.includes(achievement.reward.badge)) {
          stats.unlockedBadges.push(achievement.reward.badge);
        }
        
        newAchievements.push(achievement);
      }
    });
    
    return newAchievements;
  }

  async getAchievementsByType(type: 'weekly' | 'monthly' | 'general'): Promise<Achievement[]> {
    const stats = await this.getUserStats();
    return stats.achievements.filter(a => a.type === type);
  }

  async getCompletedAchievements(): Promise<Achievement[]> {
    const stats = await this.getUserStats();
    return stats.achievements.filter(a => a.completed);
  }

  async getAchievementProgress(): Promise<{
    weekly: { completed: number; total: number };
    monthly: { completed: number; total: number };
    general: { completed: number; total: number };
  }> {
    const stats = await this.getUserStats();
    
    const weekly = stats.achievements.filter(a => a.type === 'weekly');
    const monthly = stats.achievements.filter(a => a.type === 'monthly');
    const general = stats.achievements.filter(a => a.type === 'general');
    
    return {
      weekly: {
        completed: weekly.filter(a => a.completed).length,
        total: weekly.length
      },
      monthly: {
        completed: monthly.filter(a => a.completed).length,
        total: monthly.length
      },
      general: {
        completed: general.filter(a => a.completed).length,
        total: general.length
      }
    };
  }
}

export default new AchievementService();
