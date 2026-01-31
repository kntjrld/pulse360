function showNotif(message, type = "success") {
    const banner = document.getElementById("notifBanner");
    const msg = document.getElementById("notifMessage");

    // Set message
    msg.textContent = message;

    // Reset classes
    // banner.className = "fixed top-5 right-5 text-white px-4 py-2 rounded-lg shadow-lg opacity-0 pointer-events-none transition-all duration-500 z-50";

    // Add color based on type
    if (type === "success") {
        banner.classList.add("bg-emerald-500");
    } else if (type === "error") {
        banner.classList.add("bg-red-500");
    } else if (type === "warning") {
        banner.classList.add("bg-yellow-500", "text-black");
    } else {
        banner.classList.add("bg-gray-800");
    }

    // Show
    setTimeout(() => {
        banner.classList.remove("opacity-0", "pointer-events-none");
    }, 50);

    // Auto hide after 3s
    setTimeout(() => {
        banner.classList.add("opacity-0", "pointer-events-none");
    }, 3000);

    // Remove color classes after animation
    setTimeout(() => {
        banner.classList.remove("bg-emerald-500", "bg-red-500", "bg-yellow-500", "text-black", "bg-gray-800");
    }, 5000);
}

function openDialog(message, onConfirm) {
    const dialog = document.getElementById("confirm-dialog");
    const msgEl = document.getElementById("dialog-message");
    const confirmBtn = document.getElementById("confirm-btn");
    const cancelBtn = document.getElementById("cancel-btn");

    msgEl.textContent = message;
    dialog.classList.remove("hidden");

    confirmBtn.onclick = () => {
        onConfirm();
        dialog.classList.add("hidden");
    };

    cancelBtn.onclick = () => {
        dialog.classList.add("hidden");
    };
}