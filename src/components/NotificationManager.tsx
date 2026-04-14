'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { initializeFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export function NotificationManager() {
  const { toast } = useToast();

  useEffect(() => {
    const setupMessaging = async () => {
      // Check if window is available and if messaging is supported in the current environment
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

      try {
        const supported = await isSupported();
        if (!supported) {
          console.warn('Firebase Messaging is not supported in this browser.');
          return;
        }

        const { firebaseApp } = initializeFirebase();
        const messaging = getMessaging(firebaseApp);

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: 'BBhVnKOPUzQ4q80N8IUvoavoXtLvKT49T6BHWJgB6wpWcOs9Lcvn8YZANtdZSUJQqF4kSZ53vpWK2cwysjtxh1I'
          });
          
          if (token) {
            console.log('FCM Token generated');
            // Logic to save token to user profile would go here
          }
        }

        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          toast({
            title: payload.notification?.title || 'Study Reminder',
            description: payload.notification?.body || 'Time for your next assessment!',
          });
        });

      } catch (error) {
        // Silent catch to prevent app-wide crash if FCM fails
        console.warn('FCM setup failed silently:', error);
      }
    };

    setupMessaging();
  }, [toast]);

  return null;
}
