// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5LLllRXfJsOaBoLOiFBV318BlrFiOu1E",
  authDomain: "autobhh.firebaseapp.com",
  projectId: "autobhh",
  storageBucket: "autobhh.firebasestorage.app",
  messagingSenderId: "585142429369",
  appId: "1:585142429369:web:d16cfafb9a905088365d68"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);