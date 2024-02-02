// Function to load all registered Client of the database
window.electron.findAllClientFacture();
// Function to load all registered Service of the database
window.electron.findAllServiceFacture();
// Function to load all registered Linge of the database at the row 1 in the second table with id=`clothes_details`
window.electron.findAllLingeFacture(1);
// Function to load Js Files
loadJsFiles();
// Function to update total amount to pay
setTimeout(() => {
  update_total();
}, 2000);

var n = 1;

// Function to update clothe info in a row
function update_clothe_info(element) {
  update_total();
}

// Function to update the total amount to pay
function update_total() {
  let total = 0;
  // Sum all clothes prices
  for (let index = 1; index <= n; index++) {
    total += parseInt(
      document.getElementById("clothe_priceUnitary" + index).value
    );
  }
  // Get service TAX
  total =
    total +
    (getServiceTAX() * total) / 100 -
    (getClientReduction() * total) / 100;
  document.getElementById("total_to_pay").value = total;
  update_remaining_to_pay();
}

// Function to get the service TAX
function getServiceTAX() {
  const serviceTAX = document.getElementById("service_type").value;
  return parseFloat(serviceTAX.substring(serviceTAX.indexOf("*") + 1));
}

// Function to get the client reduction
function getClientReduction() {
  const serviceTAX = document.getElementById("client_name_select").value;
  return parseFloat(serviceTAX.substring(serviceTAX.indexOf("_") + 1));
}

// Function to update remaining amount to pay
function update_remaining_to_pay() {
  document.getElementById("remaining_to_pay").value =
    document.getElementById("total_to_pay").value -
    document.getElementById("amount_paid").value;
}

// Function to add row in a table
function AddRow() {
  n++;

  var table = document.getElementById("clothes_details");
  var row = table.insertRow(n);
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell4 = row.insertCell(3);
  var cell5 = row.insertCell(4);
  var cell6 = row.insertCell(5);

  cell1.innerHTML =
    '<select id="clothe_code' +
    n +
    '" class="form-control js-example-basic-single" style="width: 100%;" onchange="autoSelectClothesDetails(this,' +
    n +
    ')"></select>';
  cell2.innerHTML =
    '<select id="clothe_type' +
    n +
    '" class="form-control js-example-basic-single" style="width: 100%;" onchange="" disabled></select>';
  cell3.innerHTML =
    '<select id="clothe_name' +
    n +
    '" class="form-control js-example-basic-single" style="width: 100%;" onchange="autoSelectClothesDetails(this,' +
    n +
    ')"></select>';
  cell4.innerHTML =
    '<select id="clothe_description' +
    n +
    '" class="form-control js-example-basic-single" style="width: 100%;" onchange="" disabled></select>';
  cell5.innerHTML =
    '<select id="clothe_priceUnitary' +
    n +
    '" class="form-control js-example-basic-single" style="width: 100%;" onchange="update_clothe_info(this)" disabled></select>';
  cell6.innerHTML =
    '<div onclick="RemoveRow(this)" class="text-center rounded bg-danger"><div class="center-svg"><i class="fa fa-minus"> </i></div></div>';

  document.getElementById("clothes_number").value = n;

  // Function to load all registered Linge of the database at the row 1 in the second table with id=`n`
  window.electron.findAllLingeFacture(n);
  // Function to load Js Files
  loadJsFiles();
  // Hide or Show button to Add Row in the table
  if (n === 10) {
    document.getElementById("buttonToAddRowInTable").hidden = true;
  } else {
    document.getElementById("buttonToAddRowInTable").hidden = false;
  }
  // Function to update the total amount to pay
  setTimeout(() => {
    update_total();
  }, 2000);
}

// Function to remove a row from a table
function RemoveRow(x) {
  let rowIndex = x.parentElement.parentElement.rowIndex;
  // Get the table with its id
  var table = document.getElementById("clothes_details");
  //   Delete the row
  table.deleteRow(rowIndex);
  //   Update cells id
  for (let index = rowIndex + 1; index <= n; index++) {
    document.getElementById("clothe_code" + index).id =
      "clothe_code" + (index - 1);
    document.getElementById("clothe_type" + index).id =
      "clothe_type" + (index - 1);
    document.getElementById("clothe_name" + index).id =
      "clothe_name" + (index - 1);
    // document.getElementById("clothe_description" + index).id =
    //   "clothe_description" + (index - 1);
    document.getElementById("clothe_priceUnitary" + index).id =
      "clothe_priceUnitary" + (index - 1);
  }
  //   Update the number of rows
  n--;
  // Hide or Show button to Add Row in the table
  if (n === 10) {
    document.getElementById("buttonToAddRowInTable").hidden = true;
  } else {
    document.getElementById("buttonToAddRowInTable").hidden = false;
  }
  //   Update the clothe number
  document.getElementById("clothes_number").value = n;
  //   Update the total amount to pay
  update_total();
  // }
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

// Function to auto select other clothes details when the one details is selected
function autoSelectClothesDetails(element, rowIndex) {
  if (element.id === "clothe_code" + rowIndex) {
    var event = new Event("change");
    // auto select clothe_type
    const clothe_type = document.getElementById("clothe_type" + rowIndex);
    clothe_type.selectedIndex = element.selectedIndex;
    clothe_type.dispatchEvent(event);
    // auto select clothe_name
    const clothe_name = document.getElementById("clothe_name" + rowIndex);
    clothe_name.selectedIndex = element.selectedIndex;
    clothe_name.dispatchEvent(event);
    // auto select clothe_description
    // const clothe_description = document.getElementById(
    //   "clothe_description" + rowIndex
    // );
    // clothe_description.selectedIndex = element.selectedIndex;
    // clothe_description.dispatchEvent(event);
    // auto select clothe_priceUnitary
    const clothe_priceUnitary = document.getElementById(
      "clothe_priceUnitary" + rowIndex
    );
    clothe_priceUnitary.selectedIndex = element.selectedIndex;
    clothe_priceUnitary.dispatchEvent(event);
  } else if (element.id === "clothe_name" + rowIndex) {
    var event = new Event("change");
    // auto select clothe_code
    const clothe_code = document.getElementById("clothe_code" + rowIndex);
    clothe_code.selectedIndex = element.selectedIndex;
    clothe_code.dispatchEvent(event);
    // auto select clothe_type
    const clothe_type = document.getElementById("clothe_type" + rowIndex);
    clothe_type.selectedIndex = element.selectedIndex;
    clothe_type.dispatchEvent(event);
    // auto select clothe_description
    // const clothe_description = document.getElementById(
    //   "clothe_description" + rowIndex
    // );
    // clothe_description.selectedIndex = element.selectedIndex;
    // clothe_description.dispatchEvent(event);
    // auto select clothe_priceUnitary
    const clothe_priceUnitary = document.getElementById(
      "clothe_priceUnitary" + rowIndex
    );
    clothe_priceUnitary.selectedIndex = element.selectedIndex;
    clothe_priceUnitary.dispatchEvent(event);
  }
  update_total();
}

// Function to create an instance of Facture
function createFactureController() {
  if (document.getElementById("dateRetraitFacture").value === "") {
    document.getElementById("message").innerHTML =
      '<strong style="color: red;">Veuillez renseigner la date de retrait !!</strong>';
    return;
  }

  const data = {
    depotData: {
      dateDepotFacture: document.getElementById("dateDepotFacture").value,
      dateRetraitFacture: document.getElementById("dateRetraitFacture").value,
      etatFacture: false,
      montantTotalFacture: parseFloat(
        document.getElementById("total_to_pay").value
      ),
      idClient: parseInt(
        document
          .getElementById("client_name_select")
          .value.substring(
            0,
            document.getElementById("service_type").value.indexOf("_")
          )
      ),
      idService: parseInt(
        document
          .getElementById("service_type")
          .value.substring(
            0,
            document.getElementById("service_type").value.indexOf("_")
          )
      ),
    },
    reglementData: parseInt(document.getElementById("amount_paid").value),
    lingeData: [],
  };
  for (let indexRow = 1; indexRow <= n; indexRow++) {
    data.lingeData.push({
      idClothe: parseInt(
        document.getElementById("clothe_name" + indexRow).value
      ),
      descriptionClothe: document.getElementById(
        "clothe_description" + indexRow
      ).value,
    });
  }
  // console.log(data);
  // for (let index = 0; index < 50; index++) {
  window.electron.createFacture(data);
  // }
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

// Function to update Withdraw date
function withdrawDateUpdate() {
  
}