
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAO9BrV23fOG3lFzFrK6nYL89hgHeYGJbU",
  authDomain: "findit-lost-and-found-2a831.firebaseapp.com",
  projectId: "findit-lost-and-found-2a831",
  storageBucket: "findit-lost-and-found-2a831.firebasestorage.app",
  messagingSenderId: "844723409293",
  appId: "1:844723409293:web:8345e6894c05a9045aedc4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
