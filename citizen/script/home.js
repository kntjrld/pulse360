// home.js (for the dashboard)
console.log("home.js loaded");
import { auth, db, storage } from "/config/firebase-config.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
    collection, addDoc, serverTimestamp, getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

let userLocation = null;

// Event listeners for the dashboard UI
const reportBtn = document.getElementById('reportIncident');
const cameraInput = document.getElementById('cameraInput');
const locationInfo = document.getElementById('locationInfo');
const imagePreview = document.getElementById('image-preview');
const sendReportBtn = document.getElementById('sendReportBtn');
const logoutBtn = document.getElementById('logoutBtn');

// --- Geolocation: Detects user's location upon page load ---
const getGeolocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                locationInfo.innerHTML =
                    `<p><strong>Status:</strong> Location detected!</p>
                    <p>Lat: ${userLocation.latitude.toFixed(4)}, Lng: ${userLocation.longitude.toFixed(4)}</p>`;
            },
            (error) => {
                console.error("Geolocation error:", error);
                locationInfo.innerHTML =
                    `<p><strong>Status:</strong> Location detection failed. Please enable location services.</p>`;
            }
        );
    } else {
        locationInfo.innerHTML =
            `<p><strong>Status:</strong> Geolocation not supported by your browser.</p>`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Check if the user is authenticated; if not, redirect to login
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "../index.html";
        } else {
            getGeolocation();
        }
    });

    // --- Camera Access and Image Handling ---
    reportBtn.addEventListener('click', () => {
        cameraInput.click();
    });

    cameraInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.style.maxWidth = "100%";
                img.style.height = "auto";
                imagePreview.innerHTML = '';
                imagePreview.appendChild(img);
                sendReportBtn.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // --- Report Submission ---
    sendReportBtn.addEventListener('click', async () => {
        try {
            console.log("Send report clicked");
            const file = cameraInput.files[0];
            console.log("Selected file:", file);
            console.log("User location:", userLocation);

            if (!userLocation) {
                showNotif("Location not detected yet.", "error");
                return;
            }
            if (!file) {
                showNotif("No image captured.", "error");
                return;
            }

            const storageRef = ref(storage, `reports/${Date.now()}-${file.name}`);
            console.log("Uploading to storage:", storageRef.fullPath);
            await uploadBytes(storageRef, file);

            const imageURL = await getDownloadURL(storageRef);
            console.log("Image URL:", imageURL);

            const report = {
                reportId: await generateReportNumber(),
                userId: auth.currentUser.email,
                reportedBy: auth.currentUser.displayName,
                location: userLocation,
                imageURL: imageURL,
                timestamp: serverTimestamp(),
                status: "pending"
            };

            await addDoc(collection(db, "reports"), report);
            console.log("Report added to Firestore:", report);
            showNotif("Report submitted successfully!", "success");

            cameraInput.value = "";
            imagePreview.innerHTML = "";
            sendReportBtn.style.display = 'none';

        } catch (err) {
            console.error("Error submitting report:", err);
            showNotif("Failed to submit report.", "error");
        }
    });


    // --- Logout Functionality ---
    logoutBtn.addEventListener('click', () => {
        signOut(auth)
            .then(() => {
                window.location.href = "../index.html";
            })
            .catch((error) => {
                console.error("Logout error:", error);
                showNotif("Logout failed: " + error.message, "error");
            });
    });
});


// generate incident report number (format: YYYY0000#)
async function generateReportNumber() {
    const year = new Date().getFullYear();
    const reportsRef = collection(db, "reports");
    const snapshot = await getDocs(query(reportsRef, orderBy("reportId", "desc"), limit(1)));
    if (snapshot.empty) {
        return `${year}00001`;
    } else {
        const lastReport = snapshot.docs[0].data();
        const lastReportId = lastReport.reportId;
        const lastNumber = parseInt(lastReportId.slice(4));
        const newNumber = (lastNumber + 1).toString().padStart(5, '0');
        return `${year}${newNumber}`;
    }
}