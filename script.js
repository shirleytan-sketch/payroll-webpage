// Sample data — replace with real data from your backend later
const stationData = [
  { station: "Downtown", employees: 24, gross: 96000, deductions: 14400, net: 81600 },
  { station: "Uptown", employees: 18, gross: 72000, deductions: 10800, net: 61200 },
  { station: "Airport", employees: 31, gross: 124000, deductions: 18600, net: 105400 },
  { station: "Riverside", employees: 12, gross: 48000, deductions: 7200, net: 40800 },
];

const positionData = [
  { position: "Manager", employees: 8, gross: 56000, deductions: 8400, net: 47600 },
  { position: "Cashier", employees: 40, gross: 96000, deductions: 14400, net: 81600 },
  { position: "Stock Clerk", employees: 22, gross: 66000, deductions: 9900, net: 56100 },
  { position: "Security", employees: 15, gross: 52500, deductions: 7875, net: 44625 },
];

function formatCurrency(value) {
  return "$" + value.toLocaleString();
}

function renderTable(bodyId, rows, labelKey) {
  const tbody = document.getElementById(bodyId);
  tbody.innerHTML = rows.map(row => `
    <tr>
      <td>${row[labelKey]}</td>
      <td>${row.employees}</td>
      <td>${formatCurrency(row.gross)}</td>
      <td>${formatCurrency(row.deductions)}</td>
      <td>${formatCurrency(row.net)}</td>
    </tr>
  `).join("");
}

renderTable("stationTableBody", stationData, "station");
renderTable("positionTableBody", positionData, "position");

// Sidebar: expand/collapse the Report submenu
const reportToggle = document.getElementById("reportToggle");
const reportSubmenu = document.getElementById("reportSubmenu");
const reportArrow = document.getElementById("reportArrow");

reportToggle.addEventListener("click", () => {
  reportSubmenu.classList.toggle("open");
  reportArrow.classList.toggle("open");
});

// Sidebar: switch which report is shown
const submenuItems = document.querySelectorAll(".submenu-item");
const emptyState = document.getElementById("emptyState");
const reportSections = {
  station: document.getElementById("stationReport"),
  position: document.getElementById("positionReport"),
};

submenuItems.forEach(item => {
  item.addEventListener("click", () => {
    submenuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    emptyState.classList.add("hidden");
    Object.values(reportSections).forEach(section => section.classList.add("hidden"));

    const reportKey = item.dataset.report;
    reportSections[reportKey].classList.remove("hidden");
  });
});

// Open the Report menu by default so it's discoverable
reportSubmenu.classList.add("open");
reportArrow.classList.add("open");
