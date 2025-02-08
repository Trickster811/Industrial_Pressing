// Function to load all Factures registered in the database
window.electron.findAllFacture(Date());
// Function to load Js Files
loadJsFiles();

// Generate Facture pdf
function printFacture(id_facture) {
  console.log(id_facture);
  document.getElementById("printButton").innerHTML = "Chargement";
  window.electron.generateFacturePDFFile(id_facture);
}

function filterByDate(pickedDate) {
  var currentDate = new Date(pickedDate);
  // console.log(new Date(pickedDate));
  window.electron.findAllFacture(
    currentDate.setDate(currentDate.getDate() + 1)
  );
}
