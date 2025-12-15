// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// =================================================================
// CONFIGURACIÓN DE FIREBASE
// Uses environment variables for security. Create a .env.local file
// based on .env.example with your actual Firebase credentials.
// =================================================================

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAOkom-E8eIuAmOWTF7ssk7OYamIVmiMbo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "micondoweb.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "micondoweb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "micondoweb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "156705749853",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:156705749853:web:967ec6fb8a487c229486b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Export the necessary Firebase services
export { db, storage, auth };