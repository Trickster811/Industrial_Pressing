// Function to find all Clients on page load
window.electron.findAllClient();

// Function to create an instance of Client
function createClientController() {
  if (
    document.getElementById("nomClient").value === "" ||
    document.getElementById("sexeClient").value === "" ||
    document.getElementById("phoneClient").value === "" ||
    document.getElementById("residenceClient").value === "" ||
    document.getElementById("reductionClient").value === ""
  ) {
    document.getElementById("message").innerHTML =
      '<strong style="color: red;">Veuillez renseigner le / les information(s) manquante(s) !!!!!!!!</strong>';
    return;
  }

  const data = {
    nomClient: document.getElementById("nomClient").value,
    sexeClient: document.getElementById("sexeClient").value,
    phoneClient: parseInt(document.getElementById("phoneClient").value),
    residenceClient: document.getElementById("residenceClient").value,
    reductionClient: parseFloat(
      document.getElementById("reductionClient").value
    ),
  };
  // for (let index = 0; index < 10; index++) {
  window.electron.createClient(data);
  // }
}

// Function to update an instance of a Client
function toggleupdateClient(idClient) {
  var elementToShow = document.getElementsByName("lineU" + idClient);
  var elementToHide = document.getElementsByName("line" + idClient);
  for (var i = 0; i < elementToHide.length; ++i) {
    elementToHide[i].hidden = true;
    elementToShow[i].hidden = false;
  }
}

function updateClientController(idClient) {
  const data = {
    nomClient: document.getElementById("nomClientUpdated" + idClient).value,
    sexeClient: document.getElementById("sexeClientUpdated" + idClient).value,
    phoneClient: parseInt(
      document.getElementById("phoneClientUpdated" + idClient).value
    ),
    residenceClient: document.getElementById(
      "residenceClientUpdated" + idClient
    ).value,
    reductionClient: parseFloat(
      document.getElementById("reductionClientUpdated" + idClient).value
    ),
  };
  window.electron.updateClient(data, idClient);
}

// Function to delete an instance of a Client
function deleteClientController(idClient) {
  window.electron.deleteClient({ idClient: idClient });
}
