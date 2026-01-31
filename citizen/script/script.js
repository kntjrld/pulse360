// script.js (for the login page)
import { auth, provider } from "/config/firebase-config.js";
import { signInWithPopup, onAuthStateChanged, setPersistence, browserSessionPersistence, browserLocalPersistence, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Check authentication state to redirect the user if they're already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "./page/home.html";
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

                showNotif("Login successful!", "success");

            } catch (error) {
                console.error("Google sign-in error:", error);
                showNotif("Login failed: " + error.message, "error");
            }
        });
    }
});

// Email/Password Login
document.getElementById("emailSignIn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("current-password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showNotif("Login successful!", "success");
    } catch (error) {
        showNotif("Email login failed: " + error.message, "error");
    }
});

// Forgot Password
document.getElementById("forgotPassword").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  if (!email) {
    showNotif("Please enter your email address.", "error");
    return;
  }

  try {
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      showNotif("Password reset failed: " + data.message, "error");
      return;
    }

    showNotif("Password reset email sent.", "success");
  } catch (err) {
    showNotif("Server error: " + err.message, "error");
  }
});