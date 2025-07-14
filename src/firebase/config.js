import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ Add this line

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClrySCTPrIQbbgkngypH4mKWzwmdel1dQ",
  authDomain: "moi-note-4c429.firebaseapp.com",
  projectId: "moi-note-4c429",
  storageBucket: "moi-note-4c429.firebasestorage.app",
  messagingSenderId: "847449157538",
  appId: "1:847449157538:web:d95096b807ab4a86244cfb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ Add this line

export default app;
