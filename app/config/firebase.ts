import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { enableNetwork, initializeFirestore, setLogLevel } from 'firebase/firestore';

// .env üzerinden okunan Firebase yapılandırması (Expo: EXPO_PUBLIC_* değişkenleri)
const requiredKeys = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(`Missing required env: ${key}. Did you create .env and restart Expo (expo start -c)?`);
  }
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID as string | undefined,
};

const app = initializeApp(firebaseConfig);

// React Native/Expo ortamlarında WebChannel sorunlarını önlemek için uzun anketlemeyi zorla
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  ignoreUndefinedProperties: true,
});

// Dev'de detaylı log ve ağın açık olduğundan emin ol
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  try {
    setLogLevel('debug');
    // Not: Promise beklenmeden çağrılır; hata olursa consola yazılır
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    enableNetwork(db).catch((error) => {
      console.warn('Firebase network enable failed:', error);
    });
  } catch (e) {
    console.warn('Firebase setup warning:', e);
  }
}

export const initAnalytics = async () => {
  const supported = await isSupported();
  if (supported) return getAnalytics(app);
  return null;
};

export default app;
