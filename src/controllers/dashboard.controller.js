window.electron.findStatistics();
//window.electron.Printing_chart()

// d = new Date()
// year = d.getFullYear()
// var options = { series: [{ name: "Chiffre d'affaire année " + year, type: "column", data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16] }, { name: "nombre de dépots année " + year, type: "line", data: [23, 32, 27, 38, 27, 32, 27, 38, 22, 31, 21, 16] }], chart: { height: 280, type: "line", toolbar: { show: !1 } }, stroke: { width: [0, 3], curve: "smooth" }, plotOptions: { bar: { horizontal: !1, columnWidth: "20%" } }, dataLabels: { enabled: !1 }, legend: { show: !1 }, colors: ["#6F7BD9", "#3EC59D"], labels: ["Jan", "Fev", "Mar", "Apr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Dec"] },
//   chart = new ApexCharts(document.querySelector("#line-column-chart2"), options);
// chart.render();

// Retrieve Operateur Data from Url after he Logged In
let params = new URL(document.location).searchParams;
document.getElementById("nomOperateur").innerHTML = params.get("nomOperateur");
document.getElementById("roleOperateur").innerHTML =
  params.get("roleOperateur");

// Hide / Show options within the sidebar (depending on user function)
if (params.get("roleOperateur").toLowerCase() !== "administrateur") {
  document.getElementById("settings_button").hidden = true; // Hinding Settings Menu
  document.getElementById("4").hidden = true; // Hidding `Linges` Option
  document.getElementById("7").hidden = true; // Hidding `Creances Clients` Option
  document.getElementById("10").hidden = true; // Hidding `Chiffre Affaire` Option
  document.getElementById("ressources").hidden = true; // Hidding `Ressources` Menu
}
