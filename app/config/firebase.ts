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

const missingKeys = requiredKeys.filter((key) => !process.env[key]);
export const isFirebaseConfigured = missingKeys.length === 0;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID as string | undefined,
};

let app: ReturnType<typeof initializeApp> | null = null;
export let db: ReturnType<typeof initializeFirestore> | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  // React Native/Expo ortamlarında WebChannel sorunlarını önlemek için uzun anketlemeyi zorla
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  });
} else {
  console.warn(
    `[Firebase] Missing EXPO_PUBLIC_* keys: ${missingKeys.join(
      ', '
    )}. Running in local-only mode to prevent startup crash.`
  );
}

// Dev'de detaylı log ve ağın açık olduğundan emin ol
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  try {
    if (db) {
      setLogLevel('debug');
      // Not: Promise beklenmeden çağrılır; hata olursa consola yazılır
      enableNetwork(db).catch((error) => {
        console.warn('Firebase network enable failed:', error);
      });
    }
  } catch (e) {
    console.warn('Firebase setup warning:', e);
  }
}

export const initAnalytics = async () => {
  if (!app) return null;
  const supported = await isSupported();
  if (supported) return getAnalytics(app);
  return null;
};

export default app;
