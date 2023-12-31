//alert(document.getElementById("id_I").value)
date = new Date();
m = date.getMonth() + 1;
y = date.getFullYear();
d = "";
// if (m in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
//       d = y + '-0' + m
// } else {
//       d = y + '-' + m
// }
window.electron.findAllClient_Creances();
window.electron.findAllCreances(y + "-01-01", y + "-12-31", "");

function Filtre_a() {
  if (
    document.getElementById("debut").value != "" &&
    document.getElementById("fin").value != ""
  ) {
    window.electron.findAllCreances(
      document.getElementById("debut").value,
      document.getElementById("fin").value,
      document.getElementById("client_a").value
    );
  } else {
    document.getElementById("message").innerHTML =
      '<div class="alert alert-danger alert-dismissible fade show" role="alert"> SVP Veuillez vous assurez d\'avoir remplie toutes les dates<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
    document.getElementById("creance_table_body").innerHTML =
      '<tr><th scope="row"><p name="-"  >-----</p></th><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >Aucun</p></td><td><p name="-"  > enregistrement </p></td><td><p name="-"  >trouvé</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td>"</tr>';

    document.getElementById("depots").innerHTML = 0;

    //function to find "Total" of the curent month

    document.getElementById("total").innerHTML = 0 + " FCFA";
    //function to find "Avance" of the curent month

    document.getElementById("avance").innerHTML = 0 + " FCFA";
    //function to find "Reste" of the curent month

    document.getElementById("reste").innerHTML = 0 + " FCFA";
  }

  document.getElementById("id_I").value = 1;
}

function Filtre_b() {
  if (
    document.getElementById("day").value != "" &&
    document.getElementById("month").value != "" &&
    document.getElementById("year").value != ""
  ) {
    //alert(" cas 1: Day: " + document.getElementById("day").value + "Month: " + document.getElementById("month").value + " year: " + document.getElementById("year").value)
    debut =
      document.getElementById("year").value +
      "-" +
      document.getElementById("month").value[0] +
      document.getElementById("month").value[1] +
      "-" +
      document.getElementById("day").value;
    fin =
      document.getElementById("year").value +
      "-" +
      document.getElementById("month").value[0] +
      document.getElementById("month").value[1] +
      "-" +
      document.getElementById("day").value;
    //alert("debut: " + debut + " fin: " + fin)
    window.electron.findAllCreances(
      debut,
      fin,
      document.getElementById("client_b").value
    );
  } else {
    if (
      document.getElementById("day").value == "" &&
      document.getElementById("month").value != "" &&
      document.getElementById("year").value != ""
    ) {
      //alert("cas 2: Month: " + document.getElementById("month").value + " year: " + document.getElementById("year").value)
      debut =
        document.getElementById("year").value +
        "-" +
        document.getElementById("month").value[0] +
        document.getElementById("month").value[1] +
        "-" +
        "01";
      fin =
        document.getElementById("year").value +
        "-" +
        document.getElementById("month").value[0] +
        document.getElementById("month").value[1] +
        "-" +
        "31";
      //alert("debut: " + debut + " fin: " + fin)
      window.electron.findAllCreances(
        debut,
        fin,
        document.getElementById("client_b").value
      );
    } else {
      if (
        document.getElementById("day").value == "" &&
        document.getElementById("month").value == "" &&
        document.getElementById("year").value != ""
      ) {
        //alert("cas 3:  year: " + document.getElementById("year").value)
        debut = document.getElementById("year").value + "-" + "01" + "-" + "01";
        fin = document.getElementById("year").value + "-" + "12" + "-" + "31";
        //alert("debut: " + debut + " fin: " + fin)
        window.electron.findAllCreances(
          debut,
          fin,
          document.getElementById("client_b").value
        );
      } else {
        if (
          document.getElementById("day").value == "" &&
          document.getElementById("month").value == "" &&
          document.getElementById("year").value == ""
        ) {
          document.getElementById("message").innerHTML =
            '<div class="alert alert-danger alert-dismissible fade show" role="alert">veuillez choisir au moins l\'année pour filtrer<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
          document.getElementById("creance_table_body").innerHTML =
            '<tr><th scope="row"><p name="-"  >-----</p></th><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >Aucun</p></td><td><p name="-"  > enregistrement </p></td><td><p name="-"  >trouvé</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td>"</tr>';

          document.getElementById("depots").innerHTML = 0;

          //function to find "Total" of the curent month

          document.getElementById("total").innerHTML = 0 + " FCFA";
          //function to find "Avance" of the curent month

          document.getElementById("avance").innerHTML = 0 + " FCFA";
          //function to find "Reste" of the curent month

          document.getElementById("reste").innerHTML = 0 + " FCFA";
          //alert("veuillez choisir au moins l'année pour filtrer")
        }
        if (
          document.getElementById("day").value != "" &&
          document.getElementById("month").value == "" &&
          document.getElementById("year").value == ""
        ) {
          document.getElementById("message").innerHTML =
            '<div class="alert alert-danger alert-dismissible fade show" role="alert">Vous ne pouvez pas filtrer avec uniquement le jour . SVP Veuillez  completer votre date en  choisissant  un  mois et  une année et resseyez<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
          document.getElementById("creance_table_body").innerHTML =
            '<tr><th scope="row"><p name="-"  >-----</p></th><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >Aucun</p></td><td><p name="-"  > enregistrement </p></td><td><p name="-"  >trouvé</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td>"</tr>';

          document.getElementById("depots").innerHTML = 0;

          //function to find "Total" of the curent month

          document.getElementById("total").innerHTML = 0 + " FCFA";
          //function to find "Avance" of the curent month

          document.getElementById("avance").innerHTML = 0 + " FCFA";
          //function to find "Reste" of the curent month

          document.getElementById("reste").innerHTML = 0 + " FCFA";

          //alert("Vous ne pouvez pas filtrer avec uniquement le jour . SVP Veuillez votre date completer en  choisissant  un  mois et  une année et resseyez")
        }
        if (
          document.getElementById("day").value != "" &&
          document.getElementById("month").value != "" &&
          document.getElementById("year").value == ""
        ) {
          document.getElementById("message").innerHTML =
            '<div class="alert alert-danger alert-dismissible fade show" role="alert">Vous ne pouvez pas filtrer avec uniquement le jour et le mois . SVP  Veuillez  completer votre date en  choisissant  une année et resseyez<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
          document.getElementById("creance_table_body").innerHTML =
            '<tr><th scope="row"><p name="-"  >-----</p></th><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >Aucun</p></td><td><p name="-"  > enregistrement </p></td><td><p name="-"  >trouvé</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td>"</tr>';

          document.getElementById("depots").innerHTML = 0;

          //function to find "Total" of the curent month

          document.getElementById("total").innerHTML = 0 + " FCFA";
          //function to find "Avance" of the curent month

          document.getElementById("avance").innerHTML = 0 + " FCFA";
          //function to find "Reste" of the curent month

          document.getElementById("reste").innerHTML = 0 + " FCFA";

          //alert("Vous ne pouvez pas filtrer avec uniquement le jour et le mois . SVP  Veuillez votre date completer en  choisissant  une année et resseyez")
        }
        if (
          document.getElementById("day").value != "" &&
          document.getElementById("month").value == "" &&
          document.getElementById("year").value != ""
        ) {
          document.getElementById("message").innerHTML =
            '<div class="alert alert-danger alert-dismissible fade show" role="alert">Vous ne pouvez pas filtrer avec uniquement le jour et l\'année . SVP Veuillez  completer votre date en  choisissant  un mois et resseyez<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
          document.getElementById("creance_table_body").innerHTML =
            '<tr><th scope="row"><p name="-"  >-----</p></th><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >Aucun</p></td><td><p name="-"  > enregistrement </p></td><td><p name="-"  >trouvé</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td>"</tr>';

          document.getElementById("depots").innerHTML = 0;

          //function to find "Total" of the curent month

          document.getElementById("total").innerHTML = 0 + " FCFA";
          //function to find "Avance" of the curent month

          document.getElementById("avance").innerHTML = 0 + " FCFA";
          //function to find "Reste" of the curent month

          document.getElementById("reste").innerHTML = 0 + " FCFA";
          //alert("Vous ne pouvez pas filtrer avec uniquement le jour et l'année . SVP Veuillez votre date completer en  choisissant  un mois et resseyez")
        }
      }
    }
  }
  document.getElementById("id_I").value = 2;
}
function a() {
  document.getElementById("filtre_a").removeAttribute("hidden");
  document.getElementById("filtre_b").setAttribute("hidden", "true");
  document.getElementById("btn_a").style.background = "blue";
  document.getElementById("btn_b").style.background = "gray";
}

function b() {
  document.getElementById("filtre_b").removeAttribute("hidden");
  document.getElementById("filtre_a").setAttribute("hidden", "true");
  document.getElementById("btn_a").style.background = "gray";
  document.getElementById("btn_b").style.background = "blue";
}

function filtrer(a) {
  //alert(document.getElementById("select_f").options[document.getElementById("select_f").options.selectedIndex].value)
  var filtre, tableau, ligne, cellule, i, texte;

  filtre = document.getElementById("maRecherche").value.toUpperCase();
  tableau = document.getElementById("tableau");
  ligne = tableau.getElementsByTagName("tr");
  //alert(ligne.length)
  for (i = 1; i < ligne.length; i++) {
    let t = false;
    for (j = 0; j <= 8; j++) {
      if (j == 0 || j == 1 || j == 2 || j == 3 || j == 5 || j == 6) {
        cellule = ligne[i].getElementsByTagName("td")[j];

        if (cellule) {
          texte = cellule.innerText.toLocaleString();
          //alert(texte)
          if (texte.toUpperCase().indexOf(filtre) > -1) {
            ligne[i].style.display = "";
            t = true;
          }
        }
      }
    }
    if (!t) {
      ligne[i].style.display = "none";
    }
  }
}

function imprimer() {
  if (document.getElementById("id_I").value == "") {
    titre = " Etat des créances de l'année " + y;
    window.electron.generate_Creances_PDFFile(
      y + "-01-01",
      y + "-12-31",
      0,
      titre
    );
  } else {
    if (document.getElementById("id_I").value == 1) {
      if (
        document.getElementById("debut").value != "" &&
        document.getElementById("fin").value != ""
      ) {
        d = new Date(document.getElementById("debut").value);
        f = new Date(document.getElementById("fin").value);
        titre =
          " Etat des créances allant du " +
          d.toLocaleDateString("en-US") +
          " au " +
          f.toLocaleDateString("en-US");
        window.electron.generate_Creances_PDFFile(
          document.getElementById("debut").value,
          document.getElementById("fin").value,
          document.getElementById("client_a").value,
          titre
        );
      }
    } else {
      mois = [
        "",
        "Janvier",
        "Fevrier",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Decembre",
      ];

      if (
        document.getElementById("day").value != "" &&
        document.getElementById("month").value != "" &&
        document.getElementById("year").value != ""
      ) {
        debut =
          document.getElementById("year").value +
          "-" +
          document.getElementById("month").value[0] +
          document.getElementById("month").value[1] +
          "-" +
          document.getElementById("day").value;
        fin =
          document.getElementById("year").value +
          "-" +
          document.getElementById("month").value[0] +
          document.getElementById("month").value[1] +
          "-" +
          document.getElementById("day").value;
        titre = "Etat des créances du " + debut;
        window.electron.generate_Creances_PDFFile(
          debut,
          fin,
          document.getElementById("client_b").value,
          titre
        );
      } else {
        if (
          document.getElementById("day").value == "" &&
          document.getElementById("month").value != "" &&
          document.getElementById("year").value != ""
        ) {
          debut =
            document.getElementById("year").value +
            "-" +
            document.getElementById("month").value[0] +
            document.getElementById("month").value[1] +
            "-" +
            "01";
          fin =
            document.getElementById("year").value +
            "-" +
            document.getElementById("month").value[0] +
            document.getElementById("month").value[1] +
            "-" +
            "31";
          titre =
            "Etat des créances du mois de " +
            mois[parseInt(document.getElementById("month").value[1])] +
            " " +
            document.getElementById("year").value;
          window.electron.generate_Creances_PDFFile(
            debut,
            fin,
            document.getElementById("client_b").value,
            titre
          );
        } else {
          if (
            document.getElementById("day").value == "" &&
            document.getElementById("month").value == "" &&
            document.getElementById("year").value != ""
          ) {
            debut =
              document.getElementById("year").value + "-" + "01" + "-" + "01";
            fin =
              document.getElementById("year").value + "-" + "12" + "-" + "31";
            titre =
              "Etat des créances de l'année " +
              document.getElementById("year").value;
            window.electron.generate_Creances_PDFFile(
              debut,
              fin,
              document.getElementById("client_b").value,
              titre
            );
          }
        }
      }
    }
  }
}
