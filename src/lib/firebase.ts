import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBG2b-kKNssnJTmWvqxaejcn7Q9-ETKKT8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "role-5e233.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "role-5e233",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "role-5e233.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "473966218047",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:473966218047:web:0b2fe94bf3e0a1e67e218a",
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Connect to emulators in development (optional)
// Commented out to use production Firebase instead of emulators
// if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
//   try {
//     // Connect to emulators (they will handle duplicate connection attempts gracefully)
//     connectAuthEmulator(auth, 'http://localhost:9099');
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   } catch (error) {
//     // Emulators might already be connected or not available
//     console.log('Firebase emulators not available or already connected');
//   }
// }

// Export configuration status
export { isFirebaseConfigured };

export default app;
