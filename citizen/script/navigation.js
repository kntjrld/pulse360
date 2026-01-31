const dashboardSection = document.getElementById("dashboardSection");
const reportsSection = document.getElementById("reportsSection");
const profileSection = document.getElementById("profileSection");

// Function to show a specific section and hide others
const showSection = (sectionName) => {
    dashboardSection.classList.add("hidden");
    reportsSection.classList.add("hidden");
    profileSection?.classList.add("hidden");

    if (sectionName === "dashboard") {
        dashboardSection.classList.remove("hidden");
    } else if (sectionName === "reports") {
        reportsSection.classList.remove("hidden");
    } else if (sectionName === "profile") {
        profileSection?.classList.remove("hidden");
    }

    // Save the current section to localStorage
    localStorage.setItem("currentSection", sectionName);
};

document.getElementById("myReportsBtn").addEventListener("click", (e) => {
    e.preventDefault();
    showSection("reports");
});

document.getElementById("profileBtn").addEventListener("click", (e) => {
    e.preventDefault();
    showSection("profile");
});

// HomeBtn
document.getElementById("HomeBtn").addEventListener("click", (e) => {
    e.preventDefault();
    showSection("dashboard");
});

document.addEventListener("DOMContentLoaded", () => {
    // Restore the last viewed section from localStorage
    const lastSection = localStorage.getItem("currentSection") || "dashboard";
    showSection(lastSection);
});