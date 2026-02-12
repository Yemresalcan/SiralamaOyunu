import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    where,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface LeaderboardEntry {
  id?: string;
  username: string;
  score: number;
  createdAt: Timestamp | any;
  deviceId?: string;
}

export interface UserData {
  username: string;
  highScore: number;
  totalGames: number;
  deviceId: string;
}

const COLLECTION_NAME = 'leaderboard';
const USER_DATA_KEY = '@ordix_user_data';

class LeaderboardService {
  // Kullanıcı adını kaydet
  async saveUsername(username: string): Promise<void> {
    try {
      const deviceId = await this.getDeviceId();
      const userData: UserData = {
        username,
        highScore: 0,
        totalGames: 0,
        deviceId
      };
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

      // Firebase hazır değilse local kayıtla devam et; uygulama açılışını bozma.
      if (!db) return;

      // Firestore'da kullanıcı dokümanını oluştur/merge et
      const userDocRef = doc(db, COLLECTION_NAME, username);
      const existing = await getDoc(userDocRef);
      await setDoc(
        userDocRef,
        {
          username,
          deviceId,
          score: existing.exists() ? existing.data()?.score ?? 0 : 0,
          createdAt: existing.exists() ? existing.data()?.createdAt ?? serverTimestamp() : serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Kullanıcı adı kaydedilemedi:', error);
      throw error;
    }
  }

  // Kullanıcı verilerini al
  async getUserData(): Promise<UserData | null> {
    try {
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Kullanıcı verileri alınamadı:', error);
      return null;
    }
  }

  // Cihaz ID'si oluştur veya al
  private async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('@device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('@device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Device ID alınamadı:', error);
      return `temp_${Date.now()}`;
    }
  }

  // Skoru gönder
  async submitScore(score: number): Promise<boolean> {
    try {
      const userData = await this.getUserData();
      if (!userData) {
        console.error('Kullanıcı verisi bulunamadı');
        return false;
      }

      if (db) {
        // Firestore'da kullanıcıya özel dokümanı upsert et ve en iyi skoru yaz
        const userDocRef = doc(db, COLLECTION_NAME, userData.username);
        const existing = await getDoc(userDocRef);
        const previousScore = existing.exists() ? (existing.data()?.score ?? 0) : 0;
        const bestScore = Math.max(previousScore, score);

        await setDoc(
          userDocRef,
          {
            username: userData.username,
            deviceId: userData.deviceId,
            score: bestScore,
            createdAt: existing.exists() ? existing.data()?.createdAt ?? serverTimestamp() : serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      // Local high score'u güncelle
      if (score > userData.highScore) {
        userData.highScore = score;
      }
      userData.totalGames += 1;
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error('Skor gönderilemedi:', error);
      return false;
    }
  }

  // Top skorları getir
  async getTopScores(limitCount: number = 100): Promise<LeaderboardEntry[]> {
    try {
      if (!db) return [];
      const qRef = query(
        collection(db, COLLECTION_NAME),
        orderBy('score', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(qRef);
      return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as LeaderboardEntry[];
    } catch (error) {
      console.error('Skorlar getirilemedi:', error);
      return [];
    }
  }

  // Kullanıcının en yüksek skorunu getir
  async getUserHighScore(username: string): Promise<number> {
    try {
      if (!db) return 0;
      const userDocRef = doc(db, COLLECTION_NAME, username);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) return snap.data().score ?? 0;
      return 0;
    } catch (error) {
      console.error('Kullanıcı high score alınamadı:', error);
      return 0;
    }
  }

  // Kullanıcının sıralamasını getir
  async getUserRank(username: string, score: number): Promise<number> {
    try {
      if (!db) return 0;
      const q = query(
        collection(db, COLLECTION_NAME),
        where('score', '>', score)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size + 1;
    } catch (error) {
      console.error('Sıralama hesaplanamadı:', error);
      return 0;
    }
  }

  // Kullanıcı adı kontrolü (benzersizlik için)
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      if (!db) return true;
      const userDocRef = doc(db, COLLECTION_NAME, username);
      const snap = await getDoc(userDocRef);
      return !snap.exists();
    } catch (error) {
      console.error('Kullanıcı adı kontrolü yapılamadı:', error);
      return true; // Hata durumunda kullanıcının devam etmesine izin ver
    }
  }

  // Kullanıcı verilerini temizle (çıkış için)
  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_DATA_KEY);
      await AsyncStorage.removeItem('@device_id');
    } catch (error) {
      console.error('Kullanıcı verileri temizlenemedi:', error);
    }
  }
}

export default new LeaderboardService();
