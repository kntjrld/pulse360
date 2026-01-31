document.addEventListener("DOMContentLoaded", () => {
  const menuLinks = document.querySelectorAll(".sidebar-menu a");
  const sections = {
    dashboard: document.getElementById("dashboard"),
    reports: document.getElementById("reports-section"),
    statistics: document.getElementById("statistics-section"),
    settings: document.getElementById("settings-section"),
  };

  // Function to show a specific section
  const showSection = (sectionName) => {
    menuLinks.forEach(l => l.classList.remove("active"));

    Object.values(sections).forEach(section => {
      section.classList.add("hidden");
    });

    if (sections[sectionName]) {
      sections[sectionName].classList.remove("hidden");

      menuLinks.forEach(link => {
        const text = link.querySelector(".menu-text")?.textContent.toLowerCase() || "";
        if (text.includes(sectionName)) {
          link.classList.add("active");
        }
      });
    }

    // Save the current section to localStorage
    localStorage.setItem("currentPdrrmoSection", sectionName);
  };

  menuLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const text = link.querySelector(".menu-text").textContent.toLowerCase();

      let sectionName = "dashboard";
      if (text.includes("reports")) sectionName = "reports";
      if (text.includes("statistics")) sectionName = "statistics";
      if (text.includes("settings")) sectionName = "settings";

      showSection(sectionName);
    });
  });

  // Restore the last viewed section from localStorage
  const lastSection = localStorage.getItem("currentPdrrmoSection") || "dashboard";
  showSection(lastSection);
});
