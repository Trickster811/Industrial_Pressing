// Function to find all services on page load
window.electron.findAllService();

// Function to create an instance of Service
function createServiceController() {
  if (
    document.getElementById("nomService").value === "" ||
    document.getElementById("descriptionService").value === "" ||
    document.getElementById("dureeService").value === "" ||
    document.getElementById("tauxService").value === ""
  ) {
    document.getElementById("message").innerHTML =
      '<strong style="color: red;">Veuillez renseigner le / les information(s) manquante(s) !!!!!!!!</strong>';
    return;
  }

  const data = {
    nomService: document.getElementById("nomService").value,
    descriptionService: document.getElementById("descriptionService").value,
    dureeService: parseInt(document.getElementById("dureeService").value),
    tauxService: parseFloat(document.getElementById("tauxService").value),
  };

  window.electron.createService(data);
}

// Function to update an instance of a service
function toggleupdateService(idService) {
  var elementToShow = document.getElementsByName("lineU" + idService);
  var elementToHide = document.getElementsByName("line" + idService);
  for (var i = 0; i < elementToHide.length; ++i) {
    elementToHide[i].hidden = true;
    elementToShow[i].hidden = false;
  }
}

function updateServiceController(idService) {
  const data = {
    nomService: document.getElementById("nomServiceUpdated" + idService).value,
    descriptionService: document.getElementById(
      "descriptionServiceUpdated" + idService
    ).value,
    dureeService: parseInt(
      document.getElementById("dureeServiceUpdated" + idService).value
    ),
    tauxService: parseFloat(
      document.getElementById("tauxServiceUpdated" + idService).value
    ),
  };
  window.electron.updateService(data, idService);
}

// Function to delete an instance of a Service
function deleteServiceController(idService) {
  window.electron.deleteService({ idService: idService });
}
