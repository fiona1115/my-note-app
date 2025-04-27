// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "fiona-genai-noteapp.firebaseapp.com",
  projectId: "fiona-genai-noteapp",
  storageBucket: "fiona-genai-noteapp.firebasestorage.app",
  messagingSenderId: "394735382383",
  appId: "1:394735382383:web:2a5f2a2ebe1b228067029a",
  measurementId: "G-M0H5SMRM3S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore
const db = getFirestore(app);
// Initialize Firebase Authentication
const auth = getAuth(app);

export { db, auth };