// statistics.js — Sample data + tall bars + horizontal chart

let incidentChart = null;

export function loadStatistics() {
  console.log("Statistics page loaded (sample data mode)");
  waitForStatisticsHTML();
}

function waitForStatisticsHTML() {
  const check = setInterval(() => {
    if (document.getElementById("incidentTotal")) {
      clearInterval(check);
      initStatisticsPage();
    }
  }, 50);
}

function initStatisticsPage() {
  loadSampleKPI();
  loadSampleChart();
  setTimeout(() => window.dispatchEvent(new Event("resize")), 200);
}

/* SAMPLE KPI VALUES */
function loadSampleKPI() {
  document.getElementById("incidentTotal").textContent = 43;
  document.getElementById("fatalCount").textContent = 5;
  document.getElementById("seriousCount").textContent = 17;
  document.getElementById("slightCount").textContent = 21;
}

/* SAMPLE INCIDENT TYPE CHART */
function loadSampleChart() {
  const typeCounts = {
    "Landslide": 3,
    "Earthquake": 2,
    "Floods": 6,
    "Fire Incidents": 6,
    "Typhoon": 6,
    "Road Incidents": 8,
    "Search & Rescue": 4,
    "Other": 6
  };

  drawIncidentChart(typeCounts);
}

/* DRAW CHART — TALLER BARS */
function drawIncidentChart(typeCounts) {
  const labels = Object.keys(typeCounts);
  const values = Object.values(typeCounts);

  const canvas = document.getElementById("incidentTypeChart");
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = 520 * dpr; // ⭐ Matches CSS height
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  if (incidentChart) {
    incidentChart.destroy();
    incidentChart = null;
  }

  incidentChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Incident Count",
        data: values,
        backgroundColor: "#3b82f6",
        borderRadius: 8,

        barThickness: 38,        // ⭐ MUCH TALLER bars
        maxBarThickness: 38,
        categoryPercentage: 0.95, // ⭐ More spacing between bars
        barPercentage: 0.9
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: { display: false }
      },

      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: "#374151" },
          grid: { color: "#e5e7eb" }
        },
        y: {
          ticks: { color: "#111827", font: { size: 14, weight: "600" } },
          grid: { display: false }
        }
      }
    }
  });
}