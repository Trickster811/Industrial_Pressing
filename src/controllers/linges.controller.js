// Function to find all Linges on page load
window.electron.findAllLinge();

// Function to create an instance of Linge
function createLingeController() {
  if (
    document.getElementById("codeLinge").value === "" ||
    document.getElementById("typeLinge").value === "" ||
    document.getElementById("designationLinge").value === "" ||
    document.getElementById("montantLinge").value === ""
  ) {
    document.getElementById("message").innerHTML =
      '<strong style="color: red;">Veuillez renseigner le / les information(s) manquante(s) !!!!!!!!</strong>';
    return;
  }

  const data = {
    codeLinge: document.getElementById("codeLinge").value,
    typeLinge: document.getElementById("typeLinge").value,
    designationLinge: document.getElementById("designationLinge").value,
    montantLinge: parseFloat(document.getElementById("montantLinge").value),
  };

  window.electron.createLinge(data);
}

// Function to update an instance of a Linge
function toggleupdateLinge(idLinge) {
  var elementToShow = document.getElementsByName("lineU" + idLinge);
  var elementToHide = document.getElementsByName("line" + idLinge);
  for (var i = 0; i < elementToHide.length; ++i) {
    elementToHide[i].hidden = true;
    elementToShow[i].hidden = false;
  }
}

function updateLingeController(idLinge) {
  const data = {
    codeLinge: document.getElementById("codeLingeUpdated" + idLinge).value,
    typeLinge: document.getElementById("typeLingeUpdated" + idLinge).value,
    designationLinge: document.getElementById(
      "designationLingeUpdated" + idLinge
    ).value,
    montantLinge: parseFloat(
      document.getElementById("montantLingeUpdated" + idLinge).value
    ),
  };
  window.electron.updateLinge(data, idLinge);
}

// Function to delete an instance of a Linge
function deleteLingeController(idLinge) {
  window.electron.deleteLinge({ idLinge: idLinge });
}
