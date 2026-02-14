// reports.js — SPA Reports Table + Modal Preview + Status Badges

import { db } from "/config/firebase-config.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let reportsTable = null;

/* ---------------------------------------------------------
   STATUS BADGES
--------------------------------------------------------- */
function statusBadge(status) {
  const s = (status || "").toLowerCase();

  if (s === "pending") return `<span class="badge pending">Pending</span>`;
  if (s === "completed") return `<span class="badge completed">Completed</span>`;
  if (s === "flagged") return `<span class="badge flagged">Flagged</span>`;
  if (s === "in-progress") return `<span class="badge in-progress">In‑Progress</span>`;

  return status || "-";
}

/* ---------------------------------------------------------
   MAIN ENTRY POINT — CALLED BY navigation.js
--------------------------------------------------------- */
export async function loadReports() {
  console.log("Reports page loaded");

  const tableBody = document.querySelector("#reportsTable tbody");
  tableBody.innerHTML = "";

  // Destroy previous DataTable instance if exists
  if (reportsTable) {
    reportsTable.destroy();
    reportsTable = null;
  }

  // Fetch reports
  const reportsRef = collection(db, "reports");
  const q = query(reportsRef, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const r = doc.data();

    const lastUpdated = r.timestamp
      ? formatTimestamp(r.timestamp.seconds * 1000)
      : "-";

    const docLink = r.imageURL
      ? `<span class="doc-link" data-img="${r.imageURL}" title="View Document">
           <i class="fa-solid fa-eye"></i>
         </span>`
      : `<span style="color:#9ca3af;">—</span>`;

    const row = `
      <tr>
        <td>${r.reportId || "-"}</td>
        <td>${statusBadge(r.status)}</td>
        <td>${lastUpdated}</td>
        <td>${r.incidentType || "-"}</td>
        <td>${r.reportedBy || "-"}</td>
        <td>${r.contactNumber || r.userId || "-"}</td>
        <td>${docLink}</td>
      </tr>
    `;

    tableBody.insertAdjacentHTML("beforeend", row);
  });

  // Initialize DataTable
  reportsTable = $('#reportsTable').DataTable({
    destroy: true,
    responsive: true,
    pageLength: 10,
    order: [[2, "desc"]],
    columnDefs: [
      { orderable: false, targets: 6 }
    ]
  });

  initModalPreview();

  // Fix layout after SPA load
  setTimeout(() => window.dispatchEvent(new Event("resize")), 300);
}

/* ---------------------------------------------------------
   TIMESTAMP FORMATTER
--------------------------------------------------------- */
function formatTimestamp(ms) {
  const d = new Date(ms);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const MMM = months[d.getMonth()];
  const DD = String(d.getDate()).padStart(2, "0");
  const YYYY = d.getFullYear();
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  return `${MMM}-${DD}-${YYYY} ${HH}:${mm}`;
}

/* ---------------------------------------------------------
   IMAGE PREVIEW MODAL
--------------------------------------------------------- */
function initModalPreview() {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const closeBtn = document.getElementById("modalClose");

  document.querySelectorAll(".doc-link").forEach(link => {
    link.addEventListener("click", () => {
      modalImg.src = link.dataset.img;
      modal.classList.remove("hidden");
    });
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    modalImg.src = "";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      modalImg.src = "";
    }
  });
}