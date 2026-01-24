import { auth, provider } from "/config/firebase-config.js";
import {
  signInWithPopup,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

async function redirectIfAdmin(user) {
  const tokenResult = await user.getIdTokenResult(true);

  console.log("Firebase ID Token:", tokenResult.token);
  await navigator.clipboard.writeText(tokenResult.token);

  if (tokenResult.claims.admin) {
    showNotif("Login successful! Redirecting...", "success");
    window.location.href = "./html/home.html";
  } else {
    showNotif("Access denied. Admins only.", "error");
    await auth.signOut();
  }
}

// Google Login
document.getElementById("googleLogin").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    await redirectIfAdmin(result.user);
  } catch (error) {
    showNotif("Google login failed: " + error.message, "error");
  }
});

// Email/Password Login
document.getElementById("emailSignIn").addEventListener("click", async () => {
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await redirectIfAdmin(result.user);
  } catch (error) {
    showNotif("Email login failed: " + error.message, "error");
  }
});

// Forgot Password
document.getElementById("forgotPassword").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("username").value;
  if (!email) {
    showNotif("Please enter your email address.", "error");
    return;
  }

  try {
    const res = await fetch("/api/admin/admin-reset-password", {
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