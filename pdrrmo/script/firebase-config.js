import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZXlxZRjTKgdIGiIqugmt0YAv99I9Vp78",
  authDomain: "pulse360-50a26.firebaseapp.com",
  projectId: "pulse360-50a26",
  storageBucket: "pulse360-50a26.firebasestorage.app",
  messagingSenderId: "91768065800",
  appId: "1:91768065800:web:aa6c61d0055b3888ffa6bd",
  measurementId: "G-BJGGQHWV8Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);       // Add Firestore
const storage = getStorage(app);    // Add Storage

export { auth, provider, db, storage };
