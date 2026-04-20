'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase with extreme safety for build environments.
 * Prevents crashes during static generation if API keys are not present.
 */
export function initializeFirebase() {
  // In Next.js App Router, some client components might execute on the server 
  // during build or initial render. We guard against this.
  if (typeof window === 'undefined') {
     return { firebaseApp: null as any, auth: null as any, firestore: null as any };
  }

  const hasConfig = !!firebaseConfig.apiKey && 
                    firebaseConfig.apiKey !== 'undefined' && 
                    firebaseConfig.apiKey.length > 10;

  if (!getApps().length) {
    if (!hasConfig) {
      // Return empty services if no config is found to prevent build-time crashes.
      return { firebaseApp: null as any, auth: null as any, firestore: null as any };
    }

    try {
      // Manual initialization with config object
      const firebaseApp = initializeApp(firebaseConfig);
      return getSdks(firebaseApp);
    } catch (e) {
      console.warn('Firebase initialization failed during build fallback:', e);
      return { firebaseApp: null as any, auth: null as any, firestore: null as any };
    }
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