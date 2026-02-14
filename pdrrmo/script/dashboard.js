// dashboard.js — SPA Dashboard (map + realtime reports + auto‑zoom + dark mode tiles)

import { db, auth } from "/config/firebase-config.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

let map = null;
let hasIncidents = false;
let pendingMarkers = [];

let lightTiles = null;   // ⭐ NEW
let darkTiles = null;    // ⭐ NEW

export function loadDashboard() {
  console.log("dashboard.js: loadDashboard called");

  if (map) {
    map.remove();
    map = null;
  }

  hasIncidents = false;
  pendingMarkers = [];

  initMapAndRealtime();
  initAccessTokenBlock();

  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 200);
}

/* ---------------------------------------------------------
   MAP + REALTIME FIRESTORE
--------------------------------------------------------- */
function initMapAndRealtime() {
  try {
    if (typeof L === "undefined") {
      console.error("Leaflet (L) is not available.");
      return;
    }

    map = L.map("dashmap", { preferCanvas: true }).setView([13.22, 120.60], 16);

    /* ---------------------------------------------------------
       ⭐ TILE LAYERS (LIGHT + DARK)
    --------------------------------------------------------- */
    lightTiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    });

    darkTiles = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        attribution: "© CartoDB",
      }
    );

    // Apply correct theme on load
    if (document.documentElement.classList.contains("dark")) {
      darkTiles.addTo(map);
    } else {
      lightTiles.addTo(map);
    }

    // Listen for theme changes
    window.addEventListener("theme-changed", () => {
      switchMapTheme();
    });

    const searching = document.getElementById("searching-animation");
    if (searching) searching.style.display = "block";

  } catch (err) {
    console.error("Leaflet init error:", err);
    return;
  }

  ensurePulseCss();

  function createPulseIcon(size = 24) {
    const html = `
      <div class="pulse-icon" style="width:${size}px;height:${size}px">
        <div class="dot"></div>
      </div>
    `;
    return L.divIcon({
      className: "",
      html,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  /* ---------------------------------------------------------
     REALTIME REPORTS LISTENER
  --------------------------------------------------------- */
  const reportsRef = collection(db, "reports");
  const q = query(reportsRef, orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const report = change.doc.data();
        const { latitude, longitude } = report.location || {};

        const lat = latitude ?? 13.22;
        const lng = longitude ?? 120.60;

        const pulseIcon = createPulseIcon(34);

        const marker = L.marker([lat, lng], {
          icon: pulseIcon,
          title: report.classification || "Incident",
        }).addTo(map);

        marker.bindPopup(`
          <strong>Reported by:</strong> ${report.reportedBy}<br>
          <img src="${report.imageURL}" style="width:120px;height:auto;"><br>
          <strong>Status:</strong> ${report.status}<br>
          <strong>Classification:</strong> ${report.classification || "Pending"}
        `);

        marker.openPopup();

        if (["pending", "flagged"].includes((report.status || "").toLowerCase())) {
          pendingMarkers.push(marker);
          autoZoomToPending();
        }

        if (!hasIncidents) {
          hasIncidents = true;
          const searching = document.getElementById("searching-animation");
          if (searching) searching.style.display = "none";
        }
      }
    });
  });

  window.dashboardMap = map;

  setTimeout(() => map.invalidateSize(), 300);
}

/* ---------------------------------------------------------
   ⭐ DARK MODE MAP SWITCHER
--------------------------------------------------------- */
function switchMapTheme() {
  if (!map || !lightTiles || !darkTiles) return;

  const isDark = document.documentElement.classList.contains("dark");

  // Remove both first (prevents duplicates)
  map.removeLayer(lightTiles);
  map.removeLayer(darkTiles);

  // Add correct layer
  if (isDark) {
    darkTiles.addTo(map);
  } else {
    lightTiles.addTo(map);
  }
}

/* ---------------------------------------------------------
   AUTO‑ZOOM TO PENDING REPORTS
--------------------------------------------------------- */
function autoZoomToPending() {
  if (!map) return;

  if (pendingMarkers.length === 0) {
    map.setView([13.22, 120.60], 16, { animate: true });
    return;
  }

  if (pendingMarkers.length === 1) {
    map.flyTo(pendingMarkers[0].getLatLng(), 18, { animate: true });
    return;
  }

  const group = L.featureGroup(pendingMarkers);
  map.flyToBounds(group.getBounds(), {
    padding: [80, 80],
    animate: true
  });
}

/* ---------------------------------------------------------
   PULSE CSS LOADER
--------------------------------------------------------- */
function ensurePulseCss() {
  const href = "/pdrrmo/css/pulse.css";
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

/* ---------------------------------------------------------
   ACCESS TOKEN BLOCK
--------------------------------------------------------- */
function initAccessTokenBlock() {
  const accessToken = document.getElementById("accessToken");
  const copyBtn = document.getElementById("copyTokenBtn");

  if (!accessToken) return;

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
      console.error("Copy failed", err);
    }
  });
}

function maskToken(token) {
  if (!token) return "";
  return token.slice(0, 8) + "••••••••••••••••" + token.slice(-6);
}
