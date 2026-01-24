import { auth, provider } from "/config/firebase-config.js";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

async function redirectIfAdmin(user) {
  const tokenResult = await user.getIdTokenResult(true);

  console.log("Firebase ID Token:", tokenResult.token);
  await navigator.clipboard.writeText(tokenResult.token);

  if (tokenResult.claims.admin) {
    window.location.href = "./html/home.html";
  } else {
    alert("Access denied. Admins only.");
    await auth.signOut();
  }
}

// Google Login
document.getElementById("googleLogin").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    await redirectIfAdmin(result.user);
  } catch (error) {
    alert("Google login failed: " + error.message);
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
    alert("Email login failed: " + error.message);
  }
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