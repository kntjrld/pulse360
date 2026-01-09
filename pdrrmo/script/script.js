import { auth, provider } from "./firebase-config.js";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Google Login
document.getElementById("googleLogin").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(() => {
      window.location.href = "./html/home.html";
    })
    .catch((error) => {
      alert("Google login failed: " + error.message);
    });
});

// Email/Password Login
document.getElementById("emailSignIn").addEventListener("click", () => {
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "./html/home.html";
    })
    .catch((error) => {
      alert("Email login failed: " + error.message);
    });
});

// Forgot Password
document.getElementById("forgotPassword").addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("username").value;

  if (!email) {
    alert("Please enter your email first.");
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("Password reset email sent to " + email);
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});