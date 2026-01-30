// home.js (Responder Web App with real-time reports)
import { db, auth } from "/config/firebase-config.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("home.js loaded");

  // --- UI Elements ---
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggle-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const section = document.querySelector("section");

  if (!sidebar) console.warn("Sidebar (#sidebar) not found.");
  if (!toggleBtn) console.warn("Toggle button (#toggle-btn) not found.");
  if (!logoutBtn) console.warn("Logout button (#logout-btn) not found.");

  // --- Sidebar State ---
  try {
    const saved = localStorage.getItem("sidebarState");
    if (saved === "expanded") {
      sidebar?.classList.add("expanded");
      toggleBtn?.classList.add("open");
    } else {
      sidebar?.classList.remove("expanded");
      toggleBtn?.classList.remove("open");
    }
  } catch (err) {
    console.warn("Could not read sidebarState from localStorage", err);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const expanded = sidebar.classList.toggle("expanded");
      if (expanded) toggleBtn.classList.add("open");
      else toggleBtn.classList.remove("open");

      try {
        localStorage.setItem("sidebarState", expanded ? "expanded" : "collapsed");
      } catch (err) {
        console.warn("Could not save sidebarState", err);
      }
    });
  }

  // --- Logout ---
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Logout clicked");
      signOut(auth)
        .then(() => {
          console.log("Signed out");
          window.location.href = "../login.html";
        })
        .catch((err) => {
          console.error("Sign out error:", err);
          alert("Sign out failed: " + (err?.message || err));
        });
    });
  }

  // --- Auth Check ---
  if (typeof onAuthStateChanged === "function") {
    try {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          window.location.href = "../login.html";
        }
      });
    } catch (err) {
      console.warn("onAuthStateChanged failed:", err);
    }
  }

  // --- Initialize Leaflet Map ---
  let map;
  let hasIncidents = false;
  try {
    if (typeof L === "undefined") {
      console.error("Leaflet (L) is not available. Is leaflet.js loaded?");
    } else {
      map = L.map("dashmap", { preferCanvas: true }).setView([13.22, 120.60], 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // initial animation
      document.getElementById('searching-animation').style.display = 'block';

      // optional: testing marker
      // L.marker([13.22, 120.60]).addTo(map).bindPopup("Mamburao, Occidental Mindoro").openPopup();
    }
  } catch (err) {
    console.error("Leaflet init error:", err);
  }

  // --- Firestore Real-Time Reports ---
  if (map) { // ensure map is initialized
    const reportsRef = collection(db, "reports");
    const q = query(reportsRef, orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const report = change.doc.data();
          console.log("New report received:", report);

          const { latitude, longitude } = report.location;
          const marker = L.marker([latitude, longitude], { title: report.classification || "Incident" }).addTo(map);

          marker.bindPopup(`
            <strong>Reported by:</strong> ${report.userId}<br>
            <img src="${report.imageURL}" style="width:120px;height:auto;"><br>
            <strong>Status:</strong> ${report.status}<br>
            <strong>Classification:</strong> ${report.classification || "Pending"}
          `);

          // optional: automatically open popup
          marker.openPopup();

          // hide search animation
          if (!hasIncidents) {
            hasIncidents = true;
            document.getElementById('searching-animation').style.display = 'none';
          }
        }
      });
    });
  }

  // accessToken 
  const accessToken = document.getElementById("accessToken");

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      accessToken.textContent = "Not signed in";
      return;
    }

    user.getIdTokenResult(true)
      .then((result) => {
        accessToken.textContent = maskToken(result.token);
        accessToken.dataset.fullToken = result.token;
      })
      .catch((err) => {
        console.error("Error fetching token:", err);
        accessToken.textContent = "Error fetching token";
      });
  });

  function maskToken(token) {
    if (!token) return "";
    return token.slice(0, 8) + "••••••••••••••••" + token.slice(-6);
  }

  const copyBtn = document.getElementById("copyTokenBtn");

  copyBtn?.addEventListener("click", async () => {
    const token = accessToken.dataset.fullToken;
    if (!token) return;

    try {
      await navigator.clipboard.writeText(token);
      copyBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
      setTimeout(() => {
        copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i>`;
      }, 1200);
    } catch (err) {
      showNotif("Failed to copy token: " + err.message, "error");
      console.error("Copy failed", err);
    }
  });
});
