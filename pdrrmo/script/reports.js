import { db } from "/config/firebase-config.js";
import {
    collection, getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

function statusBadge(status) {
    const s = (status || "").toLowerCase();
    if (s === "pending") return `<span style="color:#f59e0b;font-weight:bold;">Pending</span>`;
    if (s === "completed") return `<span style="color:#22c55e;font-weight:bold;">Completed</span>`;
    if (s === "flagged") return `<span style="color:#ef4444;font-weight:bold;">Flagged</span>`;
    if (s === "in-progress") return `<span style="color:#3b82f6;font-weight:bold;">In-Progress</span>`;
    return status || "-";
}

async function loadReports() {
    const tableBody = document.querySelector("#reportsTable tbody");
    tableBody.innerHTML = "";

    const reportsRef = collection(db, "reports");
    const q = query(reportsRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => {
        const r = doc.data();

        const lastUpdated = r.timestamp
            ? (() => {
                const d = new Date(r.timestamp.seconds * 1000);

                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                const MMM = months[d.getMonth()];
                const DD = String(d.getDate()).padStart(2, "0");
                const YYYY = d.getFullYear();
                const HH = String(d.getHours()).padStart(2, "0");
                const mm = String(d.getMinutes()).padStart(2, "0");

                return `${MMM}-${DD}-${YYYY} ${HH}:${mm}`;
            })()
            : "-";


        const docLink = r.imageURL
            ? `<a href="${r.imageURL}" class="doc-link" target="_blank" title="View Document">
       <i class="fa-solid fa-eye"></i>
     </a>`
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

    // Init DataTable
    $('#reportsTable').DataTable({
        destroy: true,
        responsive: true,
        pageLength: 10,
        order: [[2, "desc"]],
        columnDefs: [
            { orderable: false, targets: 5 }
        ]
    });
}

loadReports();