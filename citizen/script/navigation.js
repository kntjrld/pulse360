const dashboardSection = document.getElementById("dashboardSection");
const reportsSection = document.getElementById("reportsSection");
const profileSection = document.getElementById("profileSection");

document.getElementById("myReportsBtn").addEventListener("click", (e) => {
  e.preventDefault();

  dashboardSection.classList.add("hidden");
  profileSection?.classList.add("hidden");

  reportsSection.classList.remove("hidden");
});

document.getElementById("profileBtn").addEventListener("click", (e) => {
    e.preventDefault();

    dashboardSection.classList.add("hidden");
    reportsSection.classList.add("hidden");
    profileSection?.classList.remove("hidden");
});

document.addEventListener("DOMContentLoaded", () => {
    dashboardSection.classList.remove("hidden");
    reportsSection.classList.add("hidden");
    profileSection?.classList.add("hidden");
});

// HomeBtn
document.getElementById("HomeBtn").addEventListener("click", (e) => {
    e.preventDefault();

    dashboardSection.classList.remove("hidden");
    reportsSection.classList.add("hidden");
    profileSection?.classList.add("hidden");
});