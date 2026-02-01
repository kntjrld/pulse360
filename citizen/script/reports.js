import { auth, db, storage } from "/config/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
    collection, serverTimestamp, getDocs,
    query,
    orderBy,
    limit,
    where,
    deleteDoc,
    getDoc,
    doc as fsDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { ref as storageRef, deleteObject } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// Load reports from database
async function loadUserReports() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log("User not authenticated");
            return;
        }

        const reportsRef = collection(db, "reports");
        const q = query(
            reportsRef,
            where("userId", "==", user.email),
            orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(q);
        const reportsList = document.getElementById("reportsList");

        if (snapshot.empty) {
            reportsList.innerHTML = '<p class="text-gray-500 text-center py-8">No reports yet.</p>';
            return;
        }

        reportsList.innerHTML = "";

        snapshot.forEach((doc) => {
            const report = doc.data();
            const timestamp = report.timestamp?.toDate() || new Date();
            const formattedDate = timestamp.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });

            const statusColors = {
                pending: { bg: "bg-gray-100", text: "text-gray-700" },
                flagged: { bg: "bg-red-100", text: "text-red-700" },
                "on-progress": { bg: "bg-yellow-100", text: "text-yellow-700" },
                completed: { bg: "bg-green-100", text: "text-green-700" }
            };

            const status = report.status || "pending";
            const colors = statusColors[status] || statusColors.pending;
            const displayStatus = status === "on-progress" ? "On Progress" :
                status.charAt(0).toUpperCase() + status.slice(1);

            const reportHTML = `
                <div class="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div class="flex gap-4 items-start">
                        <img src="${report.imageURL || 'https://via.placeholder.com/80'}" 
                             class="w-20 h-20 rounded-lg object-cover" 
                             onerror="this.src='https://via.placeholder.com/80'" />
                        <div>
                            <p class="text-sm text-gray-500">${formattedDate}</p>
                            <p class="font-medium text-gray-800">${report.incidentType || "Unknown Incident"}</p>
                            ${report.location ? `<p class="text-xs text-gray-600 mt-1">Lat: ${report.location.latitude?.toFixed(4)}, Lng: ${report.location.longitude?.toFixed(4)}</p>` : ''}
                            <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}">
                                ${displayStatus}
                            </span>
                        </div>
                    </div>
                                <div class="flex flex-row items-start gap-3 sm:flex-col sm:items-end">
                                ${report.location ? `
                                    <a href="https://www.google.com/maps/search/?api=1&query=${report.location.latitude},${report.location.longitude}"
                                       target="_blank" rel="noopener noreferrer"
                                       class="inline-flex items-center justify-center w-auto sm:w-28 px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-center text-sm hover:bg-blue-100">
                                        View on Map
                                    </a>
                                ` : `
                                    <button class="inline-flex items-center justify-center w-auto sm:w-28 px-3 py-2 bg-gray-100 text-gray-400 rounded-md text-center text-sm" disabled>No Location</button>
                                `}
                                <button data-id="${doc.id}"
                                    class="deleteBtn inline-flex items-center justify-center w-auto sm:w-28 px-3 py-2 bg-red-50 text-red-700 rounded-md text-center text-sm hover:bg-red-100">
                                    Delete
                                </button>
                                </div>
                </div>
            `;

            reportsList.innerHTML += reportHTML;
        });

        reportsList.onclick = async (e) => {
            const btn = e.target.closest('.deleteBtn');
            if (!btn) return;
            const id = btn.dataset.id;
            openDialog('Delete this report? This action cannot be undone.', async () => {
                await deleteReport(id);
            });
        };

        updateStatusCounts(snapshot);

    } catch (error) {
        console.error("Error loading reports:", error);
    }
}

function updateStatusCounts(snapshot) {
    let pendingCount = 0;
    let flaggedCount = 0;
    let progressCount = 0;
    let completedCount = 0;

    snapshot.forEach((doc) => {
        const status = doc.data().status || "pending";
        if (status === "pending") pendingCount++;
        else if (status === "flagged") flaggedCount++;
        else if (status === "on-progress") progressCount++;
        else if (status === "completed") completedCount++;
    });

    document.getElementById("pendingCount").textContent = pendingCount;
    document.getElementById("flaggedCount").textContent = flaggedCount;
    document.getElementById("progressCount").textContent = progressCount;
    document.getElementById("completedCount").textContent = completedCount;
}

// Initialize
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUserReports();
    }
});

// Delete report by id
async function deleteReport(id, imageURL) {
    try {
        const docRef = fsDoc(db, 'reports', id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
            showNotif('Report not found.', 'error');
            return;
        }
        const data = snap.data();
        const currentUser = auth.currentUser;
        if (!currentUser || data.userId !== currentUser.email) {
            showNotif('You are not allowed to delete this report.', 'error');
            return;
        }

        await deleteDoc(docRef);

        const storagePath = data.storagePath || data.storage_path || null;
        if (storagePath) {
            const sref = storageRef(storage, storagePath);
            await deleteObject(sref).catch(err => console.warn('Failed to delete storage object:', err));
        } else if (data.imageURL) {
            const imageURL = data.imageURL;
            const m = imageURL.match(/\/o\/([^?]+)/);
            let path = null;
            if (m && m[1]) path = decodeURIComponent(m[1]);
            if (!path) {
                const afterO = imageURL.split('/o/')[1];
                if (afterO) path = decodeURIComponent(afterO.split('?')[0]);
            }
            if (path) {
                const sref = storageRef(storage, path);
                await deleteObject(sref).catch(err => console.warn('Failed to delete storage object:', err));
            }
        }

        showNotif('Report deleted.', 'success');
        // Reload list
        loadUserReports();
    } catch (err) {
        console.error('Error deleting report:', err);
        if (err && (err.code === 'permission-denied' || (err.message && err.message.includes('Missing or insufficient permissions')))) {
            showNotif('Delete failed: insufficient permissions. Check Firestore/storage rules.', 'error');
        } else {
            showNotif('Failed to delete report.', 'error');
        }
    }
}