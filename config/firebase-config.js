import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBKaPbT9LeaejC5-SKiKQnq9KmqtksNHo8",
  authDomain: "pulse360-37249.firebaseapp.com",
  projectId: "pulse360-37249",
  storageBucket: "pulse360-37249.firebasestorage.app",
  messagingSenderId: "592210834966",
  appId: "1:592210834966:web:ef2b2dd68aa254cd456737",
  measurementId: "G-VJFYB40N88"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, provider, db, storage };