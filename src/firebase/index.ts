'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase with a fallback for build environments where 
 * configuration might be missing.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
     // Return dummy SDKs for server-side build steps if necessary
     // but most logic is client-side.
  }

  if (!getApps().length) {
    let firebaseApp: FirebaseApp;
    
    // Check if configuration is available
    const hasConfig = !!firebaseConfig.apiKey;

    try {
      // Priority 1: Firebase App Hosting Automatic Init
      firebaseApp = initializeApp();
    } catch (e) {
      if (hasConfig) {
        // Priority 2: Standard fallback using config object
        firebaseApp = initializeApp(firebaseConfig);
      } else {
        // Priority 3: Fail gracefully during build/tracing if env vars are missing
        if (process.env.NODE_ENV === "production") {
          console.warn('Firebase initialization skipped: No configuration detected. This is expected during some build stages if environment variables are not injected.');
        }
        return {
          firebaseApp: null as any,
          auth: null as any,
          firestore: null as any
        };
      }
    }

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  if (!firebaseApp) {
    return {
      firebaseApp: null as any,
      auth: null as any,
      firestore: null as any
    };
  }
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
