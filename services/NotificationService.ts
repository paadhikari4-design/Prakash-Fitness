import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { Platform } from 'react-native';

const VAPID_KEY = "BDJ5C7v8v7v8v7v8v7v8v7v8"; // Placeholder - User should replace with real VAPID key

export class NotificationService {
  static async requestPermission() {
    if (Platform.OS !== 'web' || !messaging) return null;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        console.log('FCM Token:', token);
        return token;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
    }
    return null;
  }

  static onForegroundMessage(callback: (payload: any) => void) {
    if (Platform.OS !== 'web' || !messaging) return;
    return onMessage(messaging, (payload) => {
      console.log('Message received in foreground: ', payload);
      callback(payload);
    });
  }

  // Superpower: Mock "Missed Workout" or "Streak" Notification for Demo
  static sendLocalNotification(title: string, body: string) {
    if (Platform.OS !== 'web' || !('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-512.png',
        badge: '/icon-512.png'
      });
    }
  }

  static async registerServiceWorkers() {
    if ('serviceWorker' in navigator && Platform.OS === 'web') {
      try {
        const sw = await navigator.serviceWorker.register('/sw.js');
        console.log('Main SW registered:', sw.scope);
      } catch (e) {
        console.error('SW registration failed:', e);
      }
    }
  }
}
