document.addEventListener("DOMContentLoaded", () => {
  const menuLinks = document.querySelectorAll(".sidebar-menu a");
  const sections = {
    dashboard: document.getElementById("dashboard"),
    reports: document.getElementById("reports-section"),
    statistics: document.getElementById("statistics-section"),
    settings: document.getElementById("settings-section"),
  };

  menuLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all links
      menuLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      // Hide all sections
      Object.values(sections).forEach(section => {
        section.classList.add("hidden");
      });

      // Determine which section to show
      const text = link.querySelector(".menu-text").textContent.toLowerCase();

      if (text.includes("dashboard")) sections.dashboard.classList.remove("hidden");
      if (text.includes("reports")) sections.reports.classList.remove("hidden");
      if (text.includes("statistics")) sections.statistics.classList.remove("hidden");
      if (text.includes("settings")) sections.settings.classList.remove("hidden");
    });
  });
});
