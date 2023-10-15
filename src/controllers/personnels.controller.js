// Function to find all Operateurs on page load
window.electron.findAllOperateur();

// Function to create an instance of Operateur
function createOperateurController() {
  if (
    document.getElementById("nameOperateur").value === "" ||
    document.getElementById("fonctionOperateur").value === "" ||
    document.getElementById("phoneOperateur").value === "" ||
    document.getElementById("loginOperateur").value === "" ||
    document.getElementById("passwordOperateur").value === ""
  ) {
    document.getElementById("message").innerHTML =
      '<strong style="color: red;">Veuillez renseigner le / les information(s) manquante(s) !!!!!!!!</strong>';
    return;
  }

  const data = {
    nameOperateur: document.getElementById("nameOperateur").value,
    fonctionOperateur: document.getElementById("fonctionOperateur").value,
    phoneOperateur: parseInt(document.getElementById("phoneOperateur").value),
    loginOperateur: document.getElementById("loginOperateur").value,
    passwordOperateur: document.getElementById("passwordOperateur").value,
  };

  window.electron.createOperateur(data);
}

// Function to update an instance of a Operateur
function toggleupdateOperateur(idOperateur) {
  var elementToShow = document.getElementsByName("lineU" + idOperateur);
  var elementToHide = document.getElementsByName("line" + idOperateur);
  for (var i = 0; i < elementToHide.length; ++i) {
    elementToHide[i].hidden = true;
    elementToShow[i].hidden = false;
  }
}

function updateOperateurController(idOperateur) {
  const data = {
    nameOperateur: document.getElementById("nameOperateurUpdated" + idOperateur)
      .value,
    fonctionOperateur: document.getElementById(
      "fonctionOperateurUpdated" + idOperateur
    ).value,
    phoneOperateur: parseInt(
      document.getElementById("phoneOperateurUpdated" + idOperateur).value
    ),
    loginOperateur: document.getElementById(
      "loginOperateurUpdated" + idOperateur
    ).value,
    passwordOperateur: document.getElementById(
      "passwordOperateurUpdated" + idOperateur
    ).value,
  };
  window.electron.updateOperateur(data, idOperateur);
}

// Function to delete an instance of a Operateur
function deleteOperateurController(idOperateur) {
  window.electron.deleteOperateur({ idOperateur: idOperateur });
}
