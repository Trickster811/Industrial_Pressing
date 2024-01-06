// Function to load all Factures registered in the database
window.electron.findAllFacture();
// Function to load all registered Client of the database
window.electron.findAllClientFacture();
// Function to load Js Files
loadJsFiles();

// Function to update an instance of a Linge
function toggleUpdateReglementFacture(idFacture, remainingAmount) {
  let updateButton = document.getElementsByName("updateButtonName");
  if (updateButton[0].id === "updateButton_0") {
    var elementToShow = document.getElementsByName("lineU" + idFacture);
    var elementToHide = document.getElementsByName("line" + idFacture);
    for (var i = 0; i < elementToHide.length; ++i) {
      elementToHide[i].hidden = true;
      elementToShow[i].hidden = false;
    }
    updateButton[0].id = "updateButton_1";
  } else {
    alert("yaya");
    const data = {
      montantReglementFacture: document.getElementById(
        "reglementFactureUpdate" + idFacture
      ).value,
      dateReglementFacture: new Date(),
      idFacture: idFacture,
    };
    window.electron.updateReglementFacture(data, remainingAmount);
    updateButton[0].id = "updateButton_0";
  }
}

// Function to auto select `phone number` when the `name` is selected and `name` when the `phone number` is selected
function autoSelectPhoneOrName(element) {
  var event = new Event("change");
  if (element.id === "client_name_select") {
    const phone = document.getElementById("client_phone_select");
    phone.selectedIndex = element.selectedIndex;
    phone.dispatchEvent(event);
  }
  if (element.id === "client_phone_select") {
    const facture = document.getElementById("client_name_select");
    facture.selectedIndex = element.selectedIndex;
    facture.dispatchEvent(event);
  }
  update_total();
}

// Function to load additonnal Js files
function loadJsFiles() {
  // Loading js files
  var js_0 = document.createElement("script");
  js_0.type = "text/javascript";
  js_0.src = "vendors/select2/js/select2.js";
  js_0.id = "firstSelect";
  //   document.body.removeChild(js_);
  if (document.getElementById("firstSelect")) {
    const item = document.getElementById("firstSelect");
    item.replaceWith(js_0);
  } else {
    document.body.appendChild(js_0);
  }
  var js_1 = document.createElement("script");
  js_1.type = "text/javascript";
  js_1.src = "vendors/select2/js/select2.min.js";
  js_1.id = "secondSelect";
  //   document.body.removeChild(js_);
  if (document.getElementById("secondSelect")) {
    const item = document.getElementById("secondSelect");
    item.replaceWith(js_1);
  } else {
    document.body.appendChild(js_1);
  }
}
