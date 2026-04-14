importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-sw.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-sw.js');

firebase.initializeApp({
  apiKey: true,
  authDomain: true,
  projectId: true,
  storageBucket: true,
  messagingSenderId: true,
  appId: true
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});