// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// =================================================================
// CONFIGURACIÓN DE FIREBASE
// ... (tus comentarios de configuración aquí) ...
// =================================================================

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOkom-E8eIuAmOWTF7ssk7OYamIVmiMbo",
  authDomain: "micondoweb.firebaseapp.com",
  projectId: "micondoweb",
  storageBucket: "micondoweb.firebasestorage.app",
  messagingSenderId: "156705749853",
  appId: "1:156705749853:web:967ec6fb8a487c229486b4",
  measurementId: "G-R5LT78N8CN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Export the necessary Firebase services
export { db, storage, auth };