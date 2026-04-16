import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
