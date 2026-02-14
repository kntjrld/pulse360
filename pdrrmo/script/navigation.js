import { auth, db } from "/config/firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* ---------------------------------------------------------
   ELEMENTS
--------------------------------------------------------- */
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggle-btn");
const logoutBtn = document.getElementById("logout-btn");
const pageContainer = document.getElementById("page-container");
const menuLinks = document.querySelectorAll(".sidebar-menu a");

const notifBell = document.getElementById("notifBell");
const notifDot = document.getElementById("notifDot");
const notifDropdown = document.getElementById("notifDropdown");
const notifList = document.getElementById("notifList");
const notifShowMore = document.getElementById("notifShowMore");

const userName = document.getElementById("userName");

const sidebarTitle = document.getElementById("sidebarTitle");
const topbarTitle = document.getElementById("topbarTitle");

const themeToggle = document.getElementById("themeToggle");

/* ---------------------------------------------------------
   THEME HANDLING
--------------------------------------------------------- */
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
}

function updateThemeIcon() {
  themeToggle.innerHTML = document.documentElement.classList.contains("dark")
    ? `<i class="fa-solid fa-sun"></i>`
    : `<i class="fa-solid fa-moon"></i>`;
}
updateThemeIcon();

themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  updateThemeIcon();
  window.dispatchEvent(new Event("theme-changed"));
});

/* ---------------------------------------------------------
   SIDEBAR STATE
--------------------------------------------------------- */
function applySidebarState(expanded) {
  if (expanded) {
    sidebar.classList.add("expanded");
    toggleBtn.classList.add("open");
    sidebarTitle.textContent = "Pulse360";
    topbarTitle.style.opacity = "0";
  } else {
    sidebar.classList.remove("expanded");
    toggleBtn.classList.remove("open");
    sidebarTitle.textContent = "PDRRMO Dashboard";
    topbarTitle.style.opacity = "1";
  }
}

let savedState = localStorage.getItem("sidebarState");
let expanded = savedState ? savedState === "expanded" : true;
applySidebarState(expanded);

toggleBtn.addEventListener("click", () => {
  expanded = !expanded;
  localStorage.setItem("sidebarState", expanded ? "expanded" : "collapsed");
  applySidebarState(expanded);
  setTimeout(() => window.dispatchEvent(new Event("resize")), 300);
});

/* ---------------------------------------------------------
   LOGOUT
--------------------------------------------------------- */
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("currentPdrrmoSection");
    localStorage.removeItem("sidebarState");

    signOut(auth)
      .then(() => {
        window.location.href = "/pdrrmo/login.html";
      })
      .catch((err) => {
        alert("Sign out failed: " + (err?.message || err));
      });
  });
}

/* ---------------------------------------------------------
   USER DISPLAY
--------------------------------------------------------- */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    localStorage.removeItem("currentPdrrmoSection");
    window.location.href = "/pdrrmo/login.html";
    return;
  }
  userName.textContent = user.displayName || "User";
});

/* ---------------------------------------------------------
   PAGE LOADER
--------------------------------------------------------- */
async function loadPage(page, scriptPath, initFunction) {
  const res = await fetch(`../page/${page}.html`);
  if (!res.ok) throw new Error(`Failed to load ${page}.html`);

  pageContainer.innerHTML = await res.text();

  if (scriptPath) {
    const module = await import(scriptPath);
    if (module[initFunction]) module[initFunction]();
  }

  localStorage.setItem("currentPdrrmoSection", page);
}

/* ---------------------------------------------------------
   ACTIVE MENU HIGHLIGHT (CORRECT)
--------------------------------------------------------- */
function setActiveMenu(page) {
  menuLinks.forEach(link =>
    link.classList.toggle("active", link.dataset.page === page)
  );
}

/* ---------------------------------------------------------
   SIDEBAR MENU CLICK HANDLING
--------------------------------------------------------- */
menuLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const page = link.dataset.page;

    setActiveMenu(page);

    if (page === "dashboard")
      return loadPage("dashboard", "../script/dashboard.js", "loadDashboard");
    if (page === "reports")
      return loadPage("reports", "../script/reports.js", "loadReports");
    if (page === "statistics")
      return loadPage("statistics", "../script/statistics.js", "loadStatistics");
    if (page === "settings")
      return loadPage("settings", "../script/settings.js", "initSettingsTabs");
  });
});

/* ---------------------------------------------------------
   USERNAME → OPEN SETTINGS (ACCOUNT TAB)
--------------------------------------------------------- */
userName.addEventListener("click", async () => {
  setActiveMenu("settings");

  await loadPage("settings", "../script/settings.js", "initSettingsTabs");

  const accountBtn = document.querySelector(`[data-tab="account-details"]`);
  const accountPanel = document.getElementById("account-details");

  if (accountBtn && accountPanel) {
    document.querySelectorAll(".settings-tab").forEach(btn =>
      btn.classList.remove("active")
    );
    document.querySelectorAll(".settings-panel").forEach(panel =>
      panel.classList.add("hidden")
    );

    accountBtn.classList.add("active");
    accountPanel.classList.remove("hidden");
  }
});

/* ---------------------------------------------------------
   NOTIFICATIONS
--------------------------------------------------------- */
let pendingReports = [];

function renderNotifDropdown() {
  notifList.innerHTML = "";

  if (pendingReports.length === 0) {
    notifList.innerHTML = `<div class="notif-item">No pending reports</div>`;
    return;
  }

  const recent = pendingReports.slice(0, 5);

  recent.forEach(r => {
    const time = new Date(r.timestamp.seconds * 1000).toLocaleString();

    notifList.insertAdjacentHTML(
      "beforeend",
      `
      <div class="notif-item">
        <div class="notif-item-title">${r.incidentType || "Incident"}</div>
        <div class="notif-item-time">${time}</div>
      </div>
      `
    );
  });
}

function initNotificationWatcher() {
  const reportsRef = collection(db, "reports");
  const q = query(
    reportsRef,
    where("status", "in", ["pending", "flagged"]),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, (snapshot) => {
    pendingReports = snapshot.docs.map(doc => doc.data());
    notifDot.classList.toggle("hidden", pendingReports.length === 0);
    renderNotifDropdown();
  });
}
initNotificationWatcher();

notifBell.addEventListener("click", (e) => {
  e.stopPropagation();
  notifDropdown.classList.toggle("hidden");
  notifDropdown.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!notifDropdown.contains(e.target) && !notifBell.contains(e.target)) {
    notifDropdown.classList.add("hidden");
    notifDropdown.classList.remove("show");
  }
});

notifShowMore.addEventListener("click", (e) => {
  e.preventDefault();
  notifDropdown.classList.add("hidden");
  notifDropdown.classList.remove("show");

  setActiveMenu("reports");
  loadPage("reports", "../script/reports.js", "loadReports");
});

/* ---------------------------------------------------------
   RESTORE LAST PAGE
--------------------------------------------------------- */
const lastPage = localStorage.getItem("currentPdrrmoSection") || "dashboard";
setActiveMenu(lastPage);

if (lastPage === "dashboard")
  loadPage("dashboard", "../script/dashboard.js", "loadDashboard");
else if (lastPage === "reports")
  loadPage("reports", "../script/reports.js", "loadReports");
else if (lastPage === "statistics")
  loadPage("statistics", "../script/statistics.js", "loadStatistics");
else if (lastPage === "settings")
  loadPage("settings", "../script/settings.js", "initSettingsTabs");
