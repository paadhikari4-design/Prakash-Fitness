// Scripts for firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDjOr1mWbOdxvD9Z-rLR4FVclBPu4W7lIk",
  authDomain: "ironpulse-app-2026.firebaseapp.com",
  projectId: "ironpulse-app-2026",
  storageBucket: "ironpulse-app-2026.firebasestorage.app",
  messagingSenderId: "415666956608",
  appId: "1:415666956608:web:02f65c0995a167993132a5"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-512.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
