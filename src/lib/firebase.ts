import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Hardcoded Firebase configuration for Mentur AI.
 * This ensures the app works correctly in production environments
 * where environment variables might not be consistently injected.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDLhWHrCrYI1RmthpMyAfyecX80EPWi9Uo",
  authDomain: "studio-8515730718-27b1e.firebaseapp.com",
  projectId: "studio-8515730718-27b1e",
  storageBucket: "studio-8515730718-27b1e.firebasestorage.app",
  messagingSenderId: "417674426575",
  appId: "1:417674426575:web:9c1cda1c088fd719679fba"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export Auth instance
export const auth = getAuth(app);
