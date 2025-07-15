// Get current Date
currentDate = new Date();
document.getElementById("pickedDate").value =
  currentDate.getDate() +
  " " +
  new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(currentDate) +
  " " +
  currentDate.getFullYear();

// Function to load all Factures registered in the database
window.electron.findAllFacture(currentDate);
// Function to load Js Files
loadJsFiles();

// Generate Facture pdf
function printFacture(id_facture) {
  console.log(id_facture);
  document.getElementById("printButton" + id_facture).innerHTML = "...";
  window.electron.generateFacturePDFFile(
    id_facture,
    "printButton" + id_facture
  );
}

function filterFactures() {
  var selectedDate = new Date(document.getElementById("pickedDate").value);
  var phoneClient = document.getElementById("phoneClient").value;
  window.electron.findAllFacture(
    selectedDate.setDate(selectedDate.getDate() + 1),
    phoneClient !== "" ? parseInt(phoneClient) : null
  );
}

function toggleUpdateReglementFacture(id_facture) {
  var elementToShow = document.getElementsByName("lineU" + id_facture);
  var elementToHide = document.getElementsByName("line" + id_facture);
  console.log(elementToHide);
  console.log(elementToShow);
  for (var i = 0; i < elementToHide.length; ++i) {
    elementToShow[i].hidden = false;
    elementToHide[i].hidden = true;
  }
}

function updateFactureController(idFacture, remainingAmount) {
  const data = {
    montantReglementFacture: parseFloat(
      document.getElementById("reglementFactureUpdate" + idFacture).value
    ),
    idFacture: idFacture,
    dateReglementFacture: new Date(),
  };
  console.log(data);
  window.electron.updateReglementFacture(data, remainingAmount);
}

function updateFactureRetrait(idFacture) {
  window.electron.updateFactureRetrait(idFacture);  
}