// script.js (for the login page)
import { auth, provider } from "./firebase-config.js";
import { signInWithPopup, onAuthStateChanged, setPersistence, browserSessionPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Check authentication state to redirect the user if they're already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "./html/home.html";
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Moved element queries inside this block
    const stayLoggedInCheckbox = document.getElementById('stayLoggedIn');
    const googleLoginBtn = document.getElementById('googleLogin');

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            // Determine persistence based on the checkbox
            const persistence = stayLoggedInCheckbox.checked 
                ? browserLocalPersistence 
                : browserSessionPersistence;
            
            try {
                // Set the persistence first
                await setPersistence(auth, persistence);
                
                // Then sign in with Google
                await signInWithPopup(auth, provider);
                
            } catch (error) {
                console.error("Google sign-in error:", error);
                alert("Login failed: " + error.message);
            }
        });
    }
});