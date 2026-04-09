import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Hardcoded Firebase configuration for Mentur AI.
 * Verified configuration values to ensure production reliability.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDLhwHrCrYI1RmthpMyAfyecX80EPwI9Uo",
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
