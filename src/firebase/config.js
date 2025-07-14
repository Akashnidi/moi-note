import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyClrySCTPrIQbbgkngypH4mKWzwmdel1RU",
  authDomain: "moi-note-4c429.firebaseapp.com",
  projectId: "moi-note-4c429",
  storageBucket: "moi-note-4c429.firebasestorage.app",
  messagingSenderId: "847449157538",
  appId: "1:847449157538:web:d95096b807ab4a86244c4e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
