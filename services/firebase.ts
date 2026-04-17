import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDjOr1mWbOdxvD9Z-rLR4FVclBPu4W7lIk",
  authDomain: "ironpulse-app-2026.firebaseapp.com",
  projectId: "ironpulse-app-2026",
  storageBucket: "ironpulse-app-2026.firebasestorage.app",
  messagingSenderId: "415666956608",
  appId: "1:415666956608:web:02f65c0995a167993132a5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable Offline Persistence (IndexedDB) for PWA
if (Platform.OS === 'web') {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore Persistence failed: Browser not supported');
    }
  });
}

// Initialized Messaging for Push Notifications (Web)
let messagingInstance: any = null;
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  try {
    messagingInstance = getMessaging(app);
  } catch (e) {
    console.warn("FCM not supported in this environment");
  }
}
export const messaging = messagingInstance;
