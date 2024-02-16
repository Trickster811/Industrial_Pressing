// Function to find all ChiffreAffaires on page load
// window.electron.findAllChiffreAffaire();

// Function to create an instance of ChiffreAffaire
function createChiffreAffaireController() {
  if (
    document.getElementById("janvierChiffreAffaire").value === "" ||
    document.getElementById("fevrierChiffreAffaire").value === "" ||
    document.getElementById("marsChiffreAffaire").value === "" ||
    document.getElementById("avrilChiffreAffaire").value === "" ||
    document.getElementById("maiChiffreAffaire").value === "" ||
    document.getElementById("juinChiffreAffaire").value === "" ||
    document.getElementById("juilletChiffreAffaire").value === "" ||
    document.getElementById("aoutChiffreAffaire").value === "" ||
    document.getElementById("septembreChiffreAffaire").value === "" ||
    document.getElementById("octobreChiffreAffaire").value === "" ||
    document.getElementById("novembreChiffreAffaire").value === "" ||
    document.getElementById("decembreChiffreAffaire").value === ""
  ) {
    document.getElementById("message").innerHTML =
      '<strong style="color: red;">Veuillez renseigner le / les information(s) manquante(s) !!!!!!!!</strong>';
    return;
  }

  const data = {
    janvierChiffreAffaire: parseFloat(
      document.getElementById("janvierChiffreAffaire").value
    ),
    fevrierChiffreAffaire: parseFloat(
      document.getElementById("fevrierChiffreAffaire").value
    ),
    marsChiffreAffaire: parseFloat(
      document.getElementById("marsChiffreAffaire").value
    ),
    avrilChiffreAffaire: parseFloat(
      document.getElementById("avrilChiffreAffaire").value
    ),
    maiChiffreAffaire: parseFloat(
      document.getElementById("maiChiffreAffaire").value
    ),
    juinChiffreAffaire: parseFloat(
      document.getElementById("juinChiffreAffaire").value
    ),
    juilletChiffreAffaire: parseFloat(
      document.getElementById("juilletChiffreAffaire").value
    ),
    aoutChiffreAffaire: parseFloat(
      document.getElementById("aoutChiffreAffaire").value
    ),
    septembreChiffreAffaire: parseFloat(
      document.getElementById("septembreChiffreAffaire").value
    ),
    octobreChiffreAffaire: parseFloat(
      document.getElementById("octobreChiffreAffaire").value
    ),
    novembreChiffreAffaire: parseFloat(
      document.getElementById("novembreChiffreAffaire").value
    ),
    decembreChiffreAffaire: parseFloat(
      document.getElementById("decembreChiffreAffaire").value
    ),
  };

  window.electron.createChiffreAffaire(data, 1);
}

// Function to update an instance of a ChiffreAffaire
function toggleupdateChiffreAffaire(idChiffreAffaire) {
  var elementToShow = document.getElementsByName("lineU" + idChiffreAffaire);
  var elementToHide = document.getElementsByName("line" + idChiffreAffaire);
  for (var i = 0; i < elementToHide.length; ++i) {
    elementToHide[i].hidden = true;
    elementToShow[i].hidden = false;
  }
}

function updateChiffreAffaireController(idChiffreAffaire) {
  const data = {
    nameChiffreAffaire: document.getElementById(
      "nameChiffreAffaireUpdated" + idChiffreAffaire
    ).value,
    fonctionChiffreAffaire: document.getElementById(
      "fonctionChiffreAffaireUpdated" + idChiffreAffaire
    ).value,
    phoneChiffreAffaire: parseInt(
      document.getElementById("phoneChiffreAffaireUpdated" + idChiffreAffaire)
        .value
    ),
    loginChiffreAffaire: document.getElementById(
      "loginChiffreAffaireUpdated" + idChiffreAffaire
    ).value,
    passwordChiffreAffaire: document.getElementById(
      "passwordChiffreAffaireUpdated" + idChiffreAffaire
    ).value,
  };
  window.electron.updateChiffreAffaire(data, idChiffreAffaire);
}

// Function to delete an instance of a ChiffreAffaire
function deleteChiffreAffaireController(idChiffreAffaire) {
  window.electron.deleteChiffreAffaire({ idChiffreAffaire: idChiffreAffaire });
}
