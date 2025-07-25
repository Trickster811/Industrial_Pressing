const { sequelize, DataTypes } = require("./config/database");
const { Op, where, literal } = require("sequelize");

// Getting all Models to create tables in our database
require("./src/models/index")(sequelize, DataTypes);
// Syncing Database
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Industrial Pressing database well synced");
    document.getElementById("loadingState").hidden = true;
    document.getElementById("main_content").hidden = false;
  })
  .catch((errno) => {
    console.log("yo", errno);
  });

const { contextBridge } = require("electron");
const { Service } = require("./src/models/service.model/service.model");
const { Client } = require("./src/models/client.model/client.model");
const { Operateur } = require("./src/models/operateur.model/operateur.model");
const { Linge } = require("./src/models/linge.model/linge.model");
const { Facture } = require("./src/models/facture.model/facture.model");
const {
  FactureLinge,
} = require("./src/models/factureLinge.model/factureLinge.model");

const {
  ReglementFacture,
} = require("./src/models/reglementFacture.model/reglementFacture.model");

const { jsPDF } = require("jspdf"); // will automatically load the node version
require("jspdf-autotable");
const { resolve } = require("path");

const Fs = require("fs");
const {
  ChiffreAffaire,
} = require("./src/models/parametrage.model/parametrage.model");

// ////////////////////////////////////////////////////////////////////////////// //
// //////////////////////// Controller For Log IN / OUT ///////////////////////// //
// ////////////////////////////////////////////////////////////////////////////// //

// Function to log in an user
async function login(data) {
  Operateur.findOne({ where: { loginOperateur: data.login } })
    .then((result) => {
      console.log(result);
      if (!result || result.passwordOperateur !== data.password) {
        document.getElementById("message").innerHTML =
          '<strong style="color: red;">Login ou Mot de Passe Incorrect !!!!!!!!</strong>';
        return;
      }
      window.location.href =
        "index.html?nomOperateur=" +
        result.dataValues.nameOperateur +
        "&roleOperateur=" +
        result.dataValues.fonctionOperateur;
    })
    .catch((errno) => {
      console.log(errno);
      console.log("yo", errno);
    });
}

/////////////////////////////////////////////////////////////////////////////// //
// //////////////////////// Controller For Dashboard //////////////////////////// //
// ////////////////////////////////////////////////////////////////////////////// //

// Function to find statistics "clients","depots","total","avance" and "reste"
async function findStatistics(conditions = {}) {
  //build condition for de curent month
  date = new Date();
  m = date.getMonth() + 1;
  y = date.getFullYear();
  d = "";
  if (m in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    d = y + "-0" + m;
  } else {
    d = y + "-" + m;
  }
  condition_date = {
    where: {
      [Op.and]: [
        sequelize.where(
          sequelize.fn("date", sequelize.col("dateDepotFacture")),
          ">=",
          d + "-01"
        ),
        sequelize.where(
          sequelize.fn("date", sequelize.col("dateDepotFacture")),
          "<=",
          d + "-31"
        ),
      ],
    },
  };
  //function to find occurence of Facture
  Facture.findAndCountAll(condition_date)
    .then((data) => {
      console.log("rerererere" + data);
      document.getElementById("depots").innerHTML = Number(
        data.count
      ).toLocaleString();
    })
    .catch((err) => {
      console.log(err);
    });

  //function to find occurence of Client
  Client.findAndCountAll()
    .then((data) => {
      //console.log(data)
      document.getElementById("clients").innerHTML = Number(
        data.count
      ).toLocaleString();
    })
    .catch((err) => {
      console.log(err);
    });
  //function to find "Total" of the curent month
  const montantTotal = await Facture.sum("montantTotalFacture", condition_date);
  document.getElementById("total").innerHTML =
    Number((montantTotal ??= 0)).toLocaleString() + " FCFA";

  //function to find "Avance" of the curent month
  const montantAvance = await ReglementFacture.sum("montantReglementFacture", {
    where: {
      [Op.and]: [
        sequelize.where(
          sequelize.fn("date", sequelize.col("dateReglementFacture")),
          ">=",
          d + "-01"
        ),
        sequelize.where(
          sequelize.fn("date", sequelize.col("dateReglementFacture")),
          "<=",
          d + "-31"
        ),
      ],
    },
  });

  document.getElementById("avance").innerHTML =
    Number((montantAvance ??= 0)).toLocaleString() + " FCFA";
  //function to find "Reste" of the curent month
  const reste = parseFloat(montantTotal) - parseFloat(montantAvance);
  document.getElementById("reste").innerHTML =
    Number(reste).toLocaleString() + " FCFA";

  Service.findAll()
    .then((data) => {
      let table_body = "";

      // Filling the table with the list of Services
      data
        .reverse()
        .map((item) => {
          table_body += "<tr>";
          //   First Column
          table_body +=
            '<th scope="row"><p name="line' +
            item.dataValues.idService +
            '"  class="question_content">' +
            item.dataValues.nomService +
            '</p><p name="lineU' +
            item.dataValues.idService +
            '" hidden ><input id="nomServiceUpdated' +
            item.dataValues.idService +
            '" type="text" class="form-control" placeholder="nom" value="' +
            item.dataValues.nomService +
            '"/></p></th>';
          // Second Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idService +
            '" >' +
            item.dataValues.descriptionService +
            '</p><p name="lineU' +
            item.dataValues.idService +
            '" hidden><input id="descriptionServiceUpdated' +
            item.dataValues.idService +
            '" type="text" class="form-control" placeholder="designation" value="' +
            item.dataValues.descriptionService +
            '"/></p></td>';
          // Third Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idService +
            '">' +
            item.dataValues.dureeService +
            '</p><p name="lineU' +
            item.dataValues.idService +
            '" hidden><input id="dureeServiceUpdated' +
            item.dataValues.idService +
            '" type="text" class="form-control" placeholder="duree" value="' +
            item.dataValues.dureeService +
            '"/></p></td>';
          // Fourth Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idService +
            '">' +
            item.dataValues.tauxService +
            '</p><p name="lineU' +
            item.dataValues.idService +
            '" hidden><input id="tauxServiceUpdated' +
            item.dataValues.idService +
            '" type="text" class="form-control" placeholder="taux" value="' +
            item.dataValues.tauxService +
            '"/></p></td>';
          table_body += "</tr>";
        })
        .join();

      // Assigning `table_body` to the table id within the service screen
      document.getElementById("service_table_body").innerHTML = table_body;

      // Loading js files
      var js_ = document.createElement("script");
      js_.type = "text/javascript";
      js_.src = "vendors/datatable/js/jquery.dataTables.min.js";
      js_.id = "firstJSFile";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstJSFile")) {
        const element = document.getElementById("firstJSFile");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondJSFile";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondJSFile")) {
        const item = document.getElementById("secondJSFile");
        item.replaceWith(js);
      } else {
        document.body.appendChild(js);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

//function to print Chart

async function Printing_chart_data() {
  datas = "";
  for (index = 1; index <= 12; index++) {
    //const element = array[index];

    m = index;
    d = 0;
    if (m in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      d = "-0" + m;
    } else {
      d = "-" + m;
    }
    //alert("2023" + d + '-01')
    //alert(d)
    condition_date = {
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            ">=",
            +"2023" + d + "-01"
          ),
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            "<=",
            +"2023" + d + "-31"
          ),
        ],
      },
    };
    const montant = await Facture.sum("montantTotalFacture", condition_date);

    // //console.log("olalalalalalala------->>>>>>" + montant)
    //montant = montant
    document.getElementById("c").innerHTML += montant + "_";
    datas += montant + "_";
  }
  return 1;
}

function Printing_chart() {
  //alert(Printing_chart_data())
}

/////////////////////////////////////////////////////////////////////////////// //
// //////////////////////// Controller For Creances_clients //////////////////////////// //
// ////////////////////////////////////////////////////////////////////////////// //

// Function to find all instances of a Client

async function findAllCreances(debut, fin, cli) {
  if (cli != 0) {
    condition_date = {
      attributes: {
        include: [
          [
            sequelize.fn(
              "sum",
              sequelize.col("ReglementFactures.montantReglementFacture")
            ),
            "total_reglement",
          ],
        ],
      },
      include: [
        Client,
        Service,
        {
          model: ReglementFacture,
          as: "ReglementFactures",
          // attributes: ["montantReglementFacture"]
          attributes: [],
        },
      ],
      order: [["dateDepotFacture", "ASC"]],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            ">=",
            debut
          ),
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            "<=",
            fin
          ),
        ],
        idClient: cli,
      },
      group: ["Facture.idFacture", "Client.idClient", "Service.idService"],
    };
  } else {
    condition_date = {
      attributes: {
        include: [
          [
            sequelize.fn(
              "sum",
              sequelize.col("ReglementFactures.montantReglementFacture")
            ),
            "total_reglement",
          ],
        ],
      },
      include: [
        Client,
        Service,
        {
          model: ReglementFacture,
          as: "ReglementFactures",
          // attributes: ["montantReglementFacture"]
          attributes: [],
        },
      ],
      order: [["dateDepotFacture", "ASC"]],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            ">=",
            debut
          ),
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            "<=",
            fin
          ),
        ],
      },
      group: ["Facture.idFacture", "Client.idClient", "Service.idService"],
    };
  }

  // remove all for `table_body`

  Facture.findAll(condition_date)
    .then(async (data) => {
      //function to find occurence of Facture ___start___
      document.getElementById("depots").innerHTML = Number(
        data.length
      ).toLocaleString();
      //function to find occurence of Facture ___end___
      //function to find "Total" of the curent month ___start___
      const montantTotal = data.reduce(
        (total, item) => total + item.montantTotalFacture,
        0
      );
      document.getElementById("total").innerHTML =
        Number((montantTotal ??= 0)).toLocaleString() + " FCFA";
      //function to find "Total" of the curent month ___end___

      //function to find "Avance" of the curent month ___start___
      const montantAvance = await ReglementFacture.sum(
        "montantReglementFacture",
        {
          where: {
            [Op.and]: [
              sequelize.where(
                sequelize.fn("date", sequelize.col("dateReglementFacture")),
                ">=",
                new Date(debut)
              ),
              sequelize.where(
                sequelize.fn("date", sequelize.col("dateReglementFacture")),
                "<=",
                new Date(fin)
              ),
            ],
          },
        }
      );
      document.getElementById("avance").innerHTML =
        Number(montantAvance ? montantAvance : 0).toLocaleString() + " FCFA";
      //function to find "Avance" of the curent month ___end___
      //function to find "Reste" of the curent month ___start___
      const reste =
        parseFloat(montantTotal) -
        parseFloat(montantAvance ? montantAvance : 0);
      document.getElementById("reste").innerHTML =
        Number(reste).toLocaleString() + " FCFA";
      //function to find "Reste" of the curent month ___end___

      var table_body = "",
        n = 0;
      data
        .reverse()
        .map((item) => {
          n++;
          table_body += "<tr id='t" + item.dataValues.idFacture + "'>";
          //   First Column
          table_body += '<th scope="row"><p name="-"  >' + n + "</p></th>";
          // Second Column
          table_body +=
            '<td><p name="-"  >' +
            item.dataValues.Client.nomClient +
            "</p></td>";
          // Third Column
          table_body +=
            '<td><p name="-"  >' +
            item.dataValues.Client.phoneClient +
            "</p></td>";
          // Fourth Column
          table_body +=
            '<td><p name="-"  >' +
            Number(item.dataValues.montantTotalFacture).toLocaleString() +
            "</p></td>";
          // Fifth Column
          table_body +=
            '<td><p name="-"  >' +
            Number(item.dataValues.total_reglement).toLocaleString() +
            "</p></td>";
          // Sixth Column
          table_body +=
            '<td><p name="-"  >' +
            Number(
              item.dataValues.montantTotalFacture -
                item.dataValues.total_reglement
            ).toLocaleString() +
            "</p></td>";
          // Seventh Column
          table_body +=
            '<td><p name="-"  >' +
            item.dataValues.dateDepotFacture.toLocaleDateString("en-US") +
            "</p></td>";
          // Eigth Column
          table_body +=
            '<td><p name="-"  >' +
            item.dataValues.dateRetraitFacture.toLocaleDateString("en-US") +
            "</p></td>";
          table_body += "</tr>";
        })
        .join();
      //console.log(table_body)
      // Assigning `table_body` to the table id within the client screen
      document.getElementById("creance_table_body").innerHTML = "";
      document.getElementById("creance_table_body").innerHTML = table_body;

      if (n == 0) {
        document.getElementById("creance_table_body").innerHTML =
          '<tr><th scope="row"><p name="-"  >-----</p></th><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >Aucun</p></td><td><p name="-"  > enregistrement </p></td><td><p name="-"  >trouvé</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td>"</tr>';
        document.getElementById("message").innerHTML =
          '<div class="alert alert-warning alert-dismissible fade show" role="alert">Aucun enregistrement trouvé pour votre recherche<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
      } else {
        if (n > 0) {
          document.getElementById("message").innerHTML =
            '<div class="alert alert-success alert-dismissible fade show" role="alert">Enregistrements trouvées. Résultat dans le tableau ci-dessous<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
        } else {
          document.getElementById("message").innerHTML =
            '<div class="alert alert-danger alert-dismissible fade show" role="alert">Ooopss !!! Une erreure est survenue lors de l\'exécution re votre requete mais pas de panique veuillez juste resseiller .<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
        }
      }

      // Loading js files
      var js_ = document.createElement("script");
      js_.type = "text/javascript";
      js_.src = "vendors/datatable/js/jquery.dataTables.min.js";
      js_.id = "firstJSRetrait";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstJSRetrait")) {
        const element = document.getElementById("firstJSRetrait");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondJSRetrait";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondJSRetrait")) {
        const item = document.getElementById("secondJSRetrait");
        item.replaceWith(js);
      } else {
        document.body.appendChild(js);
      }
    })
    .catch((err) => {
      console.log("yo =>>>>>>>>>>>>>>>" + err);
    });

  // const montantTotal = await Facture.sum("montantTotalFacture", condition_date);
}
/////////////////////////////////////////////

function find_C(tableau, num, tb, nn, depot, total, avance, reste) {
  if (tableau[num][2] != 0) {
    //alert(tableau[num][2])
    condition_date = {
      attributes: {
        include: [
          [
            sequelize.fn(
              "sum",
              sequelize.col("ReglementFactures.montantReglementFacture")
            ),
            "total_reglement",
          ],
        ],
      },
      include: [
        Client,
        Service,
        {
          model: ReglementFacture,
          as: "ReglementFactures",
          // attributes: ["montantReglementFacture"]
          attributes: [],
        },
      ],
      order: [["idFacture", "ASC"]],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            ">=",
            tableau[num][0]
          ),
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            "<=",
            tableau[num][1]
          ),

          ,
        ],
        idClient: tableau[num][2],
        etatFacture: 1,
      },
      group: ["Facture.idFacture", "Client.idClient", "Service.idService"],
    };
  } else {
    condition_date = {
      attributes: {
        include: [
          [
            sequelize.fn(
              "sum",
              sequelize.col("ReglementFactures.montantReglementFacture")
            ),
            "total_reglement",
          ],
        ],
      },
      include: [
        Client,
        Service,
        {
          model: ReglementFacture,
          as: "ReglementFactures",
          // attributes: ["montantReglementFacture"]
          attributes: [],
        },
      ],
      order: [["idFacture", "ASC"]],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            ">=",
            tableau[num][0]
          ),
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            "<=",
            tableau[num][1]
          ),
        ],
        etatFacture: 1,
      },
      group: ["Facture.idFacture", "Client.idClient", "Service.idService"],
    };
  }

  // remove all for `table_body`

  Facture.findAll(condition_date)
    .then(async (data) => {
      (table_body = ""), (n = 0);
      i = 0;
      tab = [];
      if (data.length != 0) {
        tab[0] =
          data[0].dataValues.dateDepotFacture.toLocaleDateString("en-US");
      }
      tt = 0;
      data.map((item) => {
        if (
          item.dataValues.dateDepotFacture.toLocaleDateString("en-US") != tab[i]
        ) {
          tab[i + 1] =
            item.dataValues.dateDepotFacture.toLocaleDateString("en-US");
          i++;
        }
      });

      r = 0;
      while (r != 1) {
        if (data.length == 0) {
          break;
        }
        index = 0;
        i = 1;
        deja = 0;
        //data.splice(0, 1)
        data.map((item) => {
          tt = 0;
          data.map((item) => {
            tt += parseInt(item.dataValues.montantTotalFacture);
          });
          if (tt <= tableau[num][3]) {
            r = 1;
          } else {
            if (
              item.dataValues.dateDepotFacture.toLocaleDateString("en-US") !=
              tab[i]
            ) {
              data.splice(index + 1, 1);
              i++;
            }

            //alert(tt)
          }
          index++;
        });
      }
      // data.map((item) => {

      //   alert(item.dataValues.montantTotalFacture)

      // })
      //alert(tt + "---" + data.length)
      depot += data.length;
      t = 0;
      dtd = "";
      dtr = "";
      cl = "";
      tel_cl = "";
      data
        .map((item) => {
          //alert(num)
          //alert(item.dataValues.dateDepotFacture.toLocaleDateString("en-US"))
          avance += parseFloat(item.dataValues.total_reglement);
          reste +=
            item.dataValues.montantTotalFacture -
            item.dataValues.total_reglement;
          total += item.dataValues.montantTotalFacture;
          n++;
          nn++;
          table_body += "<tr id='t" + item.dataValues.idFacture + "'>";
          //   First Column
          table_body += '<th scope="row"><p name="-"  >' + nn + "</p></th>";
          table_body += "<td hidden><p >" + tableau[num][4] + "</p></td>";

          // Second Column
          table_body +=
            '<td><p name="-"  >' +
            item.dataValues.Client.nomClient +
            "</p></td>";
          // Third Column
          table_body +=
            '<td><p name="-"  >' +
            item.dataValues.Client.phoneClient +
            "</p></td>";
          // Fourth Column
          table_body +=
            '<td><p name="-"  >' +
            Number(item.dataValues.montantTotalFacture).toLocaleString() +
            "</p></td>";
          // Fifth Column
          table_body +=
            '<td><p name="-"  >' +
            Number(item.dataValues.total_reglement).toLocaleString() +
            "</p></td>";
          // Sixth Column
          table_body +=
            '<td><p name="-"  >' +
            Number(
              item.dataValues.montantTotalFacture -
                item.dataValues.total_reglement
            ).toLocaleString() +
            "</p></td>";
          // Seventh Column
          table_body +=
            '<td><p name="-"  >' +
            item.dataValues.dateDepotFacture.toLocaleDateString("en-US") +
            "</p></td>";
          // Eigth Column
          table_body +=
            '<td><p name="-"  >' +
            item.dataValues.dateRetraitFacture.toLocaleDateString("en-US") +
            "</p></td>";
          table_body += "</tr>";

          dtd = item.dataValues.dateDepotFacture.toLocaleDateString("en-US");
          dtr = item.dataValues.dateRetraitFacture.toLocaleDateString("en-US");
          cl = item.dataValues.Client.nomClient;
          tel_cl = item.dataValues.Client.phoneClient;
        })
        .join();

      if (data.length != 0 && tt != tableau[num][3]) {
        //alert(cl)

        nn++;
        table_body += "<tr id='t" + 0 + "'>";
        //   First Column
        table_body += '<th scope="row"><p name="-"  >' + nn + "</p></th>";
        table_body +=
          '<td hidden><p name="-"  >' + tableau[num][4] + "</p></td>";

        // Second Column
        table_body += '<td><p name="-"  >' + cl + "</p></td>";
        // Third Column
        table_body += '<td><p name="-"  >' + tel_cl + "</p></td>";
        // Fourth Column
        table_body +=
          '<td><p name="-"  >' +
          Number(tableau[num][3] - tt).toLocaleString() +
          "</p></td>";
        // Fifth Column
        table_body +=
          '<td><p name="-"  >' +
          Number(tableau[num][3] - tt).toLocaleString() +
          "</p></td>";
        // Sixth Column
        table_body +=
          '<td><p name="-"  >' + Number(0).toLocaleString() + "</p></td>";
        // Seventh Column
        table_body += '<td><p name="-"  >' + dtd + "</p></td>";
        // Eigth Column
        table_body += '<td><p name="-"  >' + dtr + "</p></td>";
        table_body += "</tr>";

        depot++;
        total += tableau[num][3] - tt;
        reste += tableau[num][3] - tt;
      }

      //total = 100000

      //console.log(table_body)
      // Assigning `table_body` to the table id within the client screen

      // if (n == 0) {
      //   document.getElementById("creance_table_body").innerHTML =
      //     '<tr><th scope="row"><p name="-"  >-----</p></th><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >Aucun</p></td><td><p name="-"  > enregistrement </p></td><td><p name="-"  >trouvé</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td>"</tr>';
      //   document.getElementById("message").innerHTML =
      //     '<div class="alert alert-warning alert-dismissible fade show" role="alert">Aucun enregistrement trouvé pour votre recherche<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
      // } else {
      //   if (n > 0) {
      //     document.getElementById("message").innerHTML =
      //       '<div class="alert alert-success alert-dismissible fade show" role="alert">Enregistrements trouvées. Résultat dans le tableau ci-dessous<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
      //   } else {
      //     document.getElementById("message").innerHTML =
      //       '<div class="alert alert-danger alert-dismissible fade show" role="alert">Ooopss !!! Une erreure est survenue lors de l\'exécution re votre requete mais pas de panique veuillez juste resseiller .<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
      //   }
      // }
      // if (n > 0) {
      //   document.getElementById("message").innerHTML =
      //     '<div class="alert alert-success alert-dismissible fade show" role="alert">Enregistrements trouvées. Résultat dans le tableau ci-dessous<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
      // } else {
      //   document.getElementById("message").innerHTML =
      //     '<div class="alert alert-danger alert-dismissible fade show" role="alert">Ooopss !!! Une erreure est survenue lors de l\'exécution re votre requete mais pas de panique veuillez juste resseiller .<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
      // }

      if (num != tableau.length - 1) {
        // alert(num)
        tb += table_body;
        find_C(tableau, num + 1, tb, nn, depot, total, avance, reste);
      } else {
        tb += table_body;
        document.getElementById("creance_table_body").innerHTML += tb;
        // Loading js files
        var js_ = document.createElement("script");
        js_.type = "text/javascript";
        js_.src = "vendors/datatable/js/jquery.dataTables.min.js";
        js_.id = "firstJSRetrait";
        //   document.body.removeChild(js_);
        if (document.getElementById("firstJSRetrait")) {
          const element = document.getElementById("firstJSRetrait");
          element.replaceWith(js_);
        } else {
          document.body.appendChild(js_);
        }
        var js = document.createElement("script");
        js.type = "text/javascript";
        js.src = "js/custom.js";
        js.id = "secondJSRetrait";
        //   document.body.removeChild(js_);
        if (document.getElementById("secondJSRetrait")) {
          const item = document.getElementById("secondJSRetrait");
          item.replaceWith(js);
        } else {
          document.body.appendChild(js);
        }

        //function to find occurence of Facture ___start___
        document.getElementById("depots").innerHTML =
          Number(depot).toLocaleString();
        //function to find occurence of Facture ___end___
        //function to find "Total" of the curent month ___start___

        document.getElementById("total").innerHTML =
          Number((total ??= 0)).toLocaleString() + " FCFA";
        // //function to find "Total" of the curent month ___end___

        // //function to find "Avance" of the curent month ___start___

        document.getElementById("avance").innerHTML =
          Number(avance ? avance : 0).toLocaleString() + " FCFA";
        // //function to find "Avance" of the curent month ___end___
        // //function to find "Reste" of the curent month ___start___

        document.getElementById("reste").innerHTML =
          Number(reste).toLocaleString() + " FCFA";
        // //function to find "Reste" of the curent month ___end___
      }
    })
    .catch((err) => {
      console.log("yo =>>>>>>>>>>>>>>>" + err);
    });
}
/////////////////////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\
async function findAllCreances_CHF(cas, debut, fin, cli, CHF) {
  document.getElementById("creance_table_body").innerHTML = "";
  //alert(tab_chf[1])
  // sequelize
  //   .query("SELECT * FROM `ChiffreAffaire` ", {
  //     type: sequelize.QueryTypes.SELECT,
  //   })
  let tab;
  ChiffreAffaire.findAll()
    .then((b) => {
      b.map((e) => {
        tab_chf = [
          "",
          e.janvierChiffreAffaire,
          e.fevrierChiffreAffaire,
          e.marsChiffreAffaire,
          e.avrilChiffreAffaire,
          e.maiChiffreAffaire,
          e.juinChiffreAffaire,
          e.juilletChiffreAffaire,
          e.aoutChiffreAffaire,
          e.septembreChiffreAffaire,
          e.octobreChiffreAffaire,
          e.novembreChiffreAffaire,
          e.decembreChiffreAffaire,
        ];

        if (cas == 3 || cas == 0) {
          tab = [
            [
              y + "-01-01",
              y + "-01-31",
              cli,
              e.janvierChiffreAffaire,
              "janvier",
            ],
            [
              y + "-02-01",
              y + "-02-31",
              cli,
              e.fevrierChiffreAffaire,
              "fevrier",
            ],
            [y + "-03-01", y + "-03-31", cli, e.marsChiffreAffaire, "mars"],
            [y + "-04-01", y + "-04-31", cli, e.avrilChiffreAffaire, "avril"],
            [y + "-05-01", y + "-05-31", cli, e.maiChiffreAffaire, "mai"],
            [y + "-06-01", y + "-06-31", cli, e.juinChiffreAffaire, "juin"],
            [
              y + "-07-01",
              y + "-07-31",
              cli,
              e.juilletChiffreAffaire,
              "juillet",
            ],
            [y + "-08-01", y + "-08-31", cli, e.aoutChiffreAffaire, "aout"],
            [
              y + "-09-01",
              y + "-09-31",
              cli,
              e.septembreChiffreAffaire,
              "septembre",
            ],
            [
              y + "-10-01",
              y + "-10-31",
              cli,
              e.octobreChiffreAffaire,
              "octobre",
            ],
            [
              y + "-11-01",
              y + "-11-31",
              cli,
              e.novembreChiffreAffaire,
              "novembre",
            ],
            [
              y + "-12-01",
              y + "-12-31",
              cli,
              e.decembreChiffreAffaire,
              "decembre",
            ],
          ];
        } else {
          tab = [
            [
              debut,
              fin,
              cli,
              tab_chf[
                parseInt(
                  document.getElementById("month_CHF").value[0] +
                    document.getElementById("month_CHF").value[1]
                )
              ],
              "/",
            ],
          ];
        }
      }).join();
      //alert(tab)
      ind = 0;
      tb = "";
      nn = 0;
      total = depot = avance = reste = 0;
      find_C(tab, ind, tb, nn, depot, total, avance, reste);
    })
    .catch((error) => {
      console.error("Failed to retrieve chiffre d'affaire data : ", error);
    });

  // d = y + "-01-01"
  // f = y + "-01-31"

  // find_C(d, f, cli, CHF)

  // d = y + "-02-01"
  // f = y + "-02-31"

  if (cli != 0) {
    //alert(tableau[num][2])
    condition_date = {
      attributes: {
        include: [
          [
            sequelize.fn(
              "sum",
              sequelize.col("ReglementFactures.montantReglementFacture")
            ),
            "total_reglement",
          ],
        ],
      },
      include: [
        Client,
        Service,
        {
          model: ReglementFacture,
          as: "ReglementFactures",
          // attributes: ["montantReglementFacture"]
          attributes: [],
        },
      ],
      order: [["idFacture", "ASC"]],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            ">=",
            debut
          ),
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            "<=",
            fin
          ),
        ],
        idClient: cli,
        etatFacture: 1,
      },
      group: ["Facture.idFacture", "Client.idClient", "Service.idService"],
    };
  } else {
    condition_date = {
      attributes: {
        include: [
          [
            sequelize.fn(
              "sum",
              sequelize.col("ReglementFactures.montantReglementFacture")
            ),
            "total_reglement",
          ],
        ],
      },
      include: [
        Client,
        Service,
        {
          model: ReglementFacture,
          as: "ReglementFactures",
          // attributes: ["montantReglementFacture"]
          attributes: [],
        },
      ],
      order: [["idFacture", "ASC"]],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            ">=",
            debut
          ),
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            "<=",
            fin
          ),
        ],
        etatFacture: 1,
      },
      group: ["Facture.idFacture", "Client.idClient", "Service.idService"],
    };
  }

  Facture.findAll(condition_date).then(async (data) => {});
  //     var table_body = "",
  //       n = 0;
  //     i = 0;
  //     tab = []
  //     tab[0] = data[0].dataValues.dateDepotFacture.toLocaleDateString("en-US")
  //     tt = 0
  //     data.map((item) => {
  //       //alert("bbbbbbbb" + item.dataValues.dateDepotFacture.toLocaleDateString("en-US"))
  //       if (item.dataValues.dateDepotFacture.toLocaleDateString("en-US") != tab[i]) {
  //         tab[i + 1] = item.dataValues.dateDepotFacture.toLocaleDateString("en-US")
  //         i++;
  //       }
  //     })
  //     //alert("aaaaaaaaaaa" + tab)
  //     r = 0
  //     while (r != 1) {

  //       index = 0
  //       i = 1
  //       deja = 0
  //       //data.splice(0, 1)
  //       data.map((item) => {
  //         tt = 0
  //         data.map((item) => {

  //           tt += parseInt(item.dataValues.montantTotalFacture)

  //         })
  //         if (tt <= 900000) {
  //           r = 1
  //         }
  //         if (item.dataValues.dateDepotFacture.toLocaleDateString("en-US") != tab[i]) {

  //           data.splice(index + 1, 1)
  //           i++

  //         }
  //         index++

  //       })

  //     }

  //     alert(tt)

  //     t = 0
  //     data
  //       .reverse()
  //       .map((item) => {
  //         //alert(item.dataValues.dateDepotFacture.toLocaleDateString("en-US"))
  //         n++;
  //         table_body += "<tr id='t" + item.dataValues.idFacture + "'>";
  //         //   First Column
  //         table_body += '<th scope="row"><p name="-"  >' + n + "</p></th>";
  //         // Second Column
  //         table_body +=
  //           '<td><p name="-"  >' +
  //           item.dataValues.Client.nomClient +
  //           "</p></td>";
  //         // Third Column
  //         table_body +=
  //           '<td><p name="-"  >' +
  //           item.dataValues.Client.phoneClient +
  //           "</p></td>";
  //         // Fourth Column
  //         table_body +=
  //           '<td><p name="-"  >' +
  //           Number(item.dataValues.montantTotalFacture).toLocaleString() +
  //           "</p></td>";
  //         // Fifth Column
  //         table_body +=
  //           '<td><p name="-"  >' +
  //           Number(item.dataValues.total_reglement).toLocaleString() +
  //           "</p></td>";
  //         // Sixth Column
  //         table_body +=
  //           '<td><p name="-"  >' +
  //           Number(
  //             item.dataValues.montantTotalFacture -
  //             item.dataValues.total_reglement
  //           ).toLocaleString() +
  //           "</p></td>";
  //         // Seventh Column
  //         table_body +=
  //           '<td><p name="-"  >' +
  //           item.dataValues.dateDepotFacture.toLocaleDateString("en-US") +
  //           "</p></td>";
  //         // Eigth Column
  //         table_body +=
  //           '<td><p name="-"  >' +
  //           item.dataValues.dateRetraitFacture.toLocaleDateString("en-US") +
  //           "</p></td>";
  //         table_body += "</tr>";
  //       })
  //       .join();

  //     //console.log(table_body)
  //     // Assigning `table_body` to the table id within the client screen
  //     document.getElementById("creance_table_body").innerHTML = table_body;

  //     if (n == 0) {
  //       document.getElementById("creance_table_body").innerHTML =
  //         '<tr><th scope="row"><p name="-"  >-----</p></th><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >Aucun</p></td><td><p name="-"  > enregistrement </p></td><td><p name="-"  >trouvé</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td>"</tr>';
  //       document.getElementById("message").innerHTML =
  //         '<div class="alert alert-warning alert-dismissible fade show" role="alert">Aucun enregistrement trouvé pour votre recherche<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
  //     } else {
  //       if (n > 0) {
  //         document.getElementById("message").innerHTML =
  //           '<div class="alert alert-success alert-dismissible fade show" role="alert">Enregistrements trouvées. Résultat dans le tableau ci-dessous<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
  //       } else {
  //         document.getElementById("message").innerHTML =
  //           '<div class="alert alert-danger alert-dismissible fade show" role="alert">Ooopss !!! Une erreure est survenue lors de l\'exécution re votre requete mais pas de panique veuillez juste resseiller .<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
  //       }
  //     }

  //     // Loading js files
  //     var js_ = document.createElement("script");
  //     js_.type = "text/javascript";
  //     js_.src = "vendors/datatable/js/jquery.dataTables.min.js";
  //     js_.id = "firstJSRetrait";
  //     //   document.body.removeChild(js_);
  //     if (document.getElementById("firstJSRetrait")) {
  //       const element = document.getElementById("firstJSRetrait");
  //       element.replaceWith(js_);
  //     } else {
  //       document.body.appendChild(js_);
  //     }
  //     var js = document.createElement("script");
  //     js.type = "text/javascript";
  //     js.src = "js/custom.js";
  //     js.id = "secondJSRetrait";
  //     //   document.body.removeChild(js_);
  //     if (document.getElementById("secondJSRetrait")) {
  //       const item = document.getElementById("secondJSRetrait");
  //       item.replaceWith(js);
  //     } else {
  //       document.body.appendChild(js);
  //     }
  //   })
  //   .catch((err) => {
  //     console.log("yo =>>>>>>>>>>>>>>>" + err);
  //   });

  // const montantTotal = await Facture.sum("montantTotalFacture", condition_date);
}

async function findAllCreancesByExercieYear(anneExercice, chiffreAffraire) {
  // remove all for `table_body`

  Facture.findAll({
    attributes: {
      include: [
        [
          sequelize.fn(
            "sum",
            sequelize.col("ReglementFactures.montantReglementFacture")
          ),
          "total_reglement",
        ],
      ],
    },
    include: [
      Client,
      Service,
      {
        model: ReglementFacture,
        as: "ReglementFactures",
        attributes: [],
      },
    ],
    order: [["dateDepotFacture", "ASC"]],
    where: {
      [Op.and]: [
        sequelize.where(
          sequelize.fn("date", sequelize.col("dateDepotFacture")),
          "=",
          new Date(anneExercice)
        ),
      ],
    },
    group: ["Facture.idFacture", "Client.idClient", "Service.idService"],
  })
    .then(async (data) => {
      //function to find occurence of Facture ___start___
      document.getElementById("depots").innerHTML = Number(
        data.length
      ).toLocaleString();
      //function to find occurence of Facture ___end___
      //function to find "Total" of the curent month ___start___
      const montantTotal = data.reduce(
        (total, item) => total + item.montantTotalFacture,
        0
      );
      document.getElementById("total").innerHTML =
        Number((montantTotal ??= 0)).toLocaleString() + " FCFA";
      //function to find "Total" of the curent month ___end___

      //function to find "Avance" of the curent month ___start___
      const montantAvance = await ReglementFacture.sum(
        "montantReglementFacture",
        {
          where: {
            [Op.and]: [
              sequelize.where(
                sequelize.fn("date", sequelize.col("dateReglementFacture")),
                "=",
                new Date(anneExercice)
              ),
            ],
          },
        }
      );
      document.getElementById("avance").innerHTML =
        Number(montantAvance ? montantAvance : 0).toLocaleString() + " FCFA";
      //function to find "Avance" of the curent month ___end___
      //function to find "Reste" of the curent month ___start___
      const reste =
        parseFloat(montantTotal) -
        parseFloat(montantAvance ? montantAvance : 0);
      document.getElementById("reste").innerHTML =
        Number(reste).toLocaleString() + " FCFA";
      //function to find "Reste" of the curent month ___end___

      var table_body = "",
        n = 0;
      data
        .map((item) => {
          n++;
          table_body += "<tr id='t" + item.dataValues.idFacture + "'>";
          //   First Column
          table_body += '<th scope="row"><p name="-"  >' + n + "</p></th>";
          // Second Column
          table_body +=
            '<td><p name="-"  >' +
            item.dataValues.Client.nomClient +
            "</p></td>";
          // Third Column
          table_body +=
            '<td><p name="-"  >' +
            item.dataValues.Client.phoneClient +
            "</p></td>";
          // Fourth Column
          table_body +=
            '<td><p name="-"  >' +
            Number(item.dataValues.montantTotalFacture).toLocaleString() +
            "</p></td>";
          // Fifth Column
          table_body +=
            '<td><p name="-"  >' +
            Number(item.dataValues.total_reglement).toLocaleString() +
            "</p></td>";
          // Sixth Column
          table_body +=
            '<td><p name="-"  >' +
            Number(
              item.dataValues.montantTotalFacture -
                item.dataValues.total_reglement
            ).toLocaleString() +
            "</p></td>";
          // Seventh Column
          table_body +=
            '<td><p name="-"  >' +
            item.dataValues.dateDepotFacture.toLocaleDateString("en-US") +
            "</p></td>";
          // Eigth Column
          table_body +=
            '<td><p name="-"  >' +
            item.dataValues.dateRetraitFacture.toLocaleDateString("en-US") +
            "</p></td>";
          table_body += "</tr>";
        })
        .join();
      //console.log(table_body)
      // Assigning `table_body` to the table id within the client screen
      document.getElementById("creance_table_body").innerHTML = table_body;

      if (n == 0) {
        document.getElementById("creance_table_body").innerHTML =
          '<tr><th scope="row"><p name="-"  >-----</p></th><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >Aucun</p></td><td><p name="-"  > enregistrement </p></td><td><p name="-"  >trouvé</p></td><td><p name="-"  >-----</p></td><td><p name="-"  >-----</p></td>"</tr>';
        document.getElementById("message").innerHTML =
          '<div class="alert alert-warning alert-dismissible fade show" role="alert">Aucun enregistrement trouvé pour votre recherche<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
      } else {
        if (n > 0) {
          document.getElementById("message").innerHTML =
            '<div class="alert alert-success alert-dismissible fade show" role="alert">Enregistrements trouvées. Résultat dans le tableau ci-dessous<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
        } else {
          document.getElementById("message").innerHTML =
            '<div class="alert alert-danger alert-dismissible fade show" role="alert">Ooopss !!! Une erreure est survenue lors de l\'exécution re votre requete mais pas de panique veuillez juste resseiller .<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div > ';
        }
      }

      // Loading js files
      var js_ = document.createElement("script");
      js_.type = "text/javascript";
      js_.src = "vendors/datatable/js/jquery.dataTables.min.js";
      js_.id = "firstJSFileCreancesClients";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstJSFileCreancesClients")) {
        const element = document.getElementById("firstJSFileCreancesClients");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondJSFileCreancesClients";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondJSFileCreancesClients")) {
        const item = document.getElementById("secondJSFileCreancesClients");
        item.replaceWith(js);
      } else {
        document.body.appendChild(js);
      }
    })
    .catch((err) => {
      console.log("yo =>>>>>>>>>>>>>>>" + err);
    });

  // const montantTotal = await Facture.sum("montantTotalFacture", condition_date);
}

function findAllClient_Creances() {
  Client.findAll()
    .then((data) => {
      //console.log("______<<<<<<<Client_____<<<<" + data)
      document.getElementById("client_a").innerHTML =
        "<option value=0>Tous</option>";
      document.getElementById("client_b").innerHTML =
        "<option value=0>Tous</option>";
      data
        .reverse()
        .map((item) => {
          document.getElementById("client_a").innerHTML +=
            '<option value="' +
            item.dataValues.idClient +
            '" >' +
            item.dataValues.nomClient +
            " </option>";
          document.getElementById("client_b").innerHTML +=
            '<option value="' +
            item.dataValues.idClient +
            '" >' +
            item.dataValues.nomClient +
            " </option>";

          document.getElementById("client_CHF").innerHTML +=
            '<option value="' +
            item.dataValues.idClient +
            '" >' +
            item.dataValues.nomClient +
            " </option>";
        })
        .join();
    })
    .catch((err) => {
      console.log(err);
    });
}

async function generate_Creances_PDFFile(debut, fin, cli, t) {
  if (cli != 0) {
    condition_date = {
      attributes: {
        include: [
          [
            sequelize.fn(
              "sum",
              sequelize.col("ReglementFactures.montantReglementFacture")
            ),
            "total_reglement",
          ],
        ],
      },
      include: [
        Client,
        Service,
        {
          model: ReglementFacture,
          as: "ReglementFactures",
          // attributes: ["montantReglementFacture"]
          attributes: [],
        },
      ],
      order: [["dateDepotFacture", "ASC"]],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            ">=",
            debut
          ),
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            "<=",
            fin
          ),
        ],
        idClient: cli,
      },
      group: [
        "Facture.idFacture",
        "Facture.dateDepotFacture",
        "Client.idClient",
        "Service.idService",
      ],
    };
  } else {
    condition_date = {
      attributes: {
        include: [
          [
            sequelize.fn(
              "sum",
              sequelize.col("ReglementFactures.montantReglementFacture")
            ),
            "total_reglement",
          ],
        ],
      },
      include: [
        Client,
        Service,
        {
          model: ReglementFacture,
          as: "ReglementFactures",
          // attributes: ["montantReglementFacture"]
          attributes: [],
        },
      ],
      order: [["dateDepotFacture", "ASC"]],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            ">=",
            debut
          ),
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            "<=",
            fin
          ),
        ],
      },
      group: [
        "Facture.idFacture",
        "Facture.dateDepotFacture",
        "Client.idClient",
        "Service.idService",
      ],
    };
  }

  // remove all for `table_body`

  Facture.findAll(condition_date)
    .then(async (data) => {
      //function to find "Total" of the curent month
      let montantTotal = data.reduce(
        (total, item) => total + item.montantTotalFacture,
        0
      );
      montantTotal = (montantTotal ??= 0) + " FCFA ";
      //function to find "Avance" of the curent month
      let montantAvance = await ReglementFacture.sum(
        "montantReglementFacture",
        {
          where: {
            [Op.and]: [
              sequelize.where(
                sequelize.fn("date", sequelize.col("dateReglementFacture")),
                ">=",
                new Date(debut)
              ),
              sequelize.where(
                sequelize.fn("date", sequelize.col("dateReglementFacture")),
                "<=",
                new Date(fin)
              ),
            ],
          },
        }
      );
      montantAvance = (montantAvance ??= 0) + " FCFA ";
      //function to find "Reste" of the curent month
      let reste =
        parseFloat(montantTotal) -
        parseFloat(montantAvance ? montantAvance : 0);
      reste = reste + " FCFA ";

      generatePDFFile(
        data,
        debut,
        fin,
        t,
        cli,
        montantTotal,
        montantAvance,
        reste
      );
    })
    .catch((errno) => {
      console.log("bro:=>>>>>>>>>>" + errno);
    });
}

////////////////////////////////////////////////////////

function find_C_(
  tableau,
  num,
  tb,
  nn,
  depot,
  total,
  avance,
  reste,
  titre,
  t_,
  t__
) {
  //alert(t)

  if (tableau[num][2] != 0) {
    //alert(tableau[num][2])
    condition_date = {
      attributes: {
        include: [
          [
            sequelize.fn(
              "sum",
              sequelize.col("ReglementFactures.montantReglementFacture")
            ),
            "total_reglement",
          ],
        ],
      },
      include: [
        Client,
        Service,
        {
          model: ReglementFacture,
          as: "ReglementFactures",
          // attributes: ["montantReglementFacture"]
          attributes: [],
        },
      ],
      order: [["idFacture", "ASC"]],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            ">=",
            tableau[num][0]
          ),
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            "<=",
            tableau[num][1]
          ),
        ],
        idClient: tableau[num][2],
        etatFacture: 1,
      },
      group: ["Facture.idFacture", "Client.idClient", "Service.idService"],
    };
  } else {
    condition_date = {
      attributes: {
        include: [
          [
            sequelize.fn(
              "sum",
              sequelize.col("ReglementFactures.montantReglementFacture")
            ),
            "total_reglement",
          ],
        ],
      },
      include: [
        Client,
        Service,
        {
          model: ReglementFacture,
          as: "ReglementFactures",
          // attributes: ["montantReglementFacture"]
          attributes: [],
        },
      ],
      order: [["idFacture", "ASC"]],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            ">=",
            tableau[num][0]
          ),
          sequelize.where(
            sequelize.fn("date", sequelize.col("dateDepotFacture")),
            "<=",
            tableau[num][1]
          ),
        ],
        etatFacture: 1,
      },
      group: ["Facture.idFacture", "Client.idClient", "Service.idService"],
    };
  }

  // remove all for `table_body`

  Facture.findAll(condition_date)
    .then(async (data) => {
      (table_body = []), (n = 0);
      i = 0;
      tab = [];
      if (data.length != 0) {
        tab[0] =
          data[0].dataValues.dateDepotFacture.toLocaleDateString("en-US");
      }
      tt = 0;
      data.map((item) => {
        if (
          item.dataValues.dateDepotFacture.toLocaleDateString("en-US") != tab[i]
        ) {
          tab[i + 1] =
            item.dataValues.dateDepotFacture.toLocaleDateString("en-US");
          i++;
        }
      });

      r = 0;
      while (r != 1) {
        if (data.length == 0) {
          break;
        }
        index = 0;
        i = 1;
        deja = 0;
        //data.splice(0, 1)
        data.map((item) => {
          tt = 0;
          data.map((item) => {
            tt += parseInt(item.dataValues.montantTotalFacture);
          });
          if (tt <= tableau[num][3]) {
            r = 1;
          } else {
            if (
              item.dataValues.dateDepotFacture.toLocaleDateString("en-US") !=
              tab[i]
            ) {
              data.splice(index + 1, 1);
              i++;
            }

            //alert(tt)
          }
          index++;
        });
      }

      depot += data.length;
      t = 0;
      dtd = "";
      dtr = "";
      cl = "";
      tel_cl = "";
      data
        .map((item) => {
          //alert(num)
          avance += parseFloat(item.dataValues.total_reglement);
          reste +=
            item.dataValues.montantTotalFacture -
            item.dataValues.total_reglement;
          total += item.dataValues.montantTotalFacture;
          n++;
          nn++;
          table_body.push(item);

          dtd = item.dataValues.dateDepotFacture.toLocaleDateString("en-US");
          dtr = item.dataValues.dateRetraitFacture.toLocaleDateString("en-US");
          cl = item.dataValues.Client.nomClient;
          tel_cl = item.dataValues.Client.phoneClient;
        })
        .join();

      if (data.length != 0 && tt != tableau[num][3]) {
        //alert(cl)

        nn++;
        //d=data.slice()
        //d.push()

        //alert(d)
        table_body.push(data[data.length - 1]);
        //alert( table_body[table_body.length-1].montantTotalFacture - table_body[table_body.length-1].total_reglement)
        t__[num] = tableau[num][3] - tt;

        depot++;
        total += tableau[num][3] - tt;
        reste += tableau[num][3] - tt;
      }

      if (num != tableau.length - 1) {
        // alert(num)
        table_body
          .map((item) => {
            tb.push(item);
          })
          .join();
        t_[num] = tb.length;
        //tb += table_body;
        //alert(t)
        find_C_(
          tableau,
          num + 1,
          tb,
          nn,
          depot,
          total,
          avance,
          reste,
          titre,
          t_,
          t__
        );
      } else {
        //tb += table_body;

        //alert(table_body)
        table_body
          .map((item) => {
            tb.push(item);
          })
          .join();
        t_[num] = tb.length;
        generatePDFFile_CHF(
          tb,
          debut,
          fin,
          titre,
          "",
          total,
          avance,
          reste,
          t_,
          t__
        );
      }
    })
    .catch((err) => {
      console.log("yo =>>>>>>>>>>>>>>>" + err);
    });
}
//////////////////////////////////////////////////

async function generate_Creances_PDFFile_CHF(cas, debut, fin, cli, t) {
  sequelize
    .query("SELECT * FROM `ChiffreAffaire` ", {
      type: sequelize.QueryTypes.SELECT,
    })
    .then((b) => {
      b.map((e) => {
        tab_chf = [
          "",
          e.janvierChiffreAffaire,
          e.fevrierChiffreAffaire,
          e.marsChiffreAffaire,
          e.avrilChiffreAffaire,
          e.maiChiffreAffaire,
          e.juinChiffreAffaire,
          e.juilletChiffreAffaire,
          e.aoutChiffreAffaire,
          e.septembreChiffreAffaire,
          e.octobreChiffreAffaire,
          e.novembreChiffreAffaire,
          e.decembreChiffreAffaire,
        ];

        if (cas == 3 || cas == 0) {
          tab = [
            [
              y + "-01-01",
              y + "-01-31",
              cli,
              e.janvierChiffreAffaire,
              "janvier",
            ],
            [
              y + "-02-01",
              y + "-02-31",
              cli,
              e.fevrierChiffreAffaire,
              "fevrier",
            ],
            [y + "-03-01", y + "-03-31", cli, e.marsChiffreAffaire, "mars"],
            [y + "-04-01", y + "-04-31", cli, e.avrilChiffreAffaire, "avril"],
            [y + "-05-01", y + "-05-31", cli, e.maiChiffreAffaire, "mai"],
            [y + "-06-01", y + "-06-31", cli, e.juinChiffreAffaire, "juin"],
            [
              y + "-07-01",
              y + "-07-31",
              cli,
              e.juilletChiffreAffaire,
              "juillet",
            ],
            [y + "-08-01", y + "-08-31", cli, e.aoutChiffreAffaire, "aout"],
            [
              y + "-09-01",
              y + "-09-31",
              cli,
              e.septembreChiffreAffaire,
              "septembre",
            ],
            [
              y + "-10-01",
              y + "-10-31",
              cli,
              e.octobreChiffreAffaire,
              "octobre",
            ],
            [
              y + "-11-01",
              y + "-11-31",
              cli,
              e.novembreChiffreAffaire,
              "novembre",
            ],
            [
              y + "-12-01",
              y + "-12-31",
              cli,
              e.decembreChiffreAffaire,
              "decembre",
            ],
          ];
        } else {
          tab = [
            [
              debut,
              fin,
              cli,
              tab_chf[
                parseInt(
                  document.getElementById("month_CHF").value[0] +
                    document.getElementById("month_CHF").value[1]
                )
              ],
              "/",
            ],
          ];
        }
      }).join();
      //alert(t)
      ind = 0;
      tb = [];
      let t_n = ["", "", "", "", "", "", "", "", "", "", "", ""];
      let t_n_ = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
      nn = 0;
      total = depot = avance = reste = 0;
      find_C_(tab, ind, tb, nn, depot, total, avance, reste, t, t_n, t_n_);
    })
    .catch((error) => {
      console.error("Failed to retrieve chiffre d'affaire data : ", error);
    });
}

const generatePDFFile_CHF = (data, d, f, titre, cli, t, a, r, t_, t__) => {
  //alert(titre)
  const date = new Date();
  const [month, day, year] = [
    date.getMonth() + 1,
    date.getDate(),
    date.getFullYear(),
  ];
  const [hour, minutes, seconds] = [
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ];

  const addFooters = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    for (var i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        "Page " + String(i) + " / " + String(pageCount),
        doc.internal.pageSize.width / 2,
        287,
        {
          align: "center",
        }
      );
    }
  };

  var doc = new jsPDF();
  //var doc = new jsPDF("p", "pt");

  doc.setFont("courier", "italic");

  // generate the above data table
  var body = [];

  console.log(data);
  i = rst = counter = tt = tr = 0;

  for (depot of data) {
    //alert(counter)
    // alert(parseFloat(depot.dataValues.montantTotalFacture) -
    // parseFloat(
    //   depot.dataValues.total_reglement
    // ))

    if (t_[i] == counter + 1) {
      if (t__[i] != -1) {
        rst = 0;
        tt = t__[i];
        tr = t__[i];
      } else {
        rst =
          parseFloat(depot.dataValues.montantTotalFacture) -
          parseFloat(depot.dataValues.total_reglement);
        tt = depot.dataValues.montantTotalFacture;
        tr = depot.dataValues.total_reglement
          ? depot.dataValues.total_reglement
          : 0;
      }

      i++;
    } else {
      rst =
        parseFloat(depot.dataValues.montantTotalFacture) -
        parseFloat(depot.dataValues.total_reglement);
      tt = depot.dataValues.montantTotalFacture;
      tr = depot.dataValues.total_reglement
        ? depot.dataValues.total_reglement
        : 0;
    }
    body.push([
      counter + 1,
      depot.dataValues.Client.nomClient,
      depot.dataValues.Client.phoneClient,
      tt,
      tr,
      rst,
      depot.dataValues.dateDepotFacture.toLocaleDateString("en-US"),
      depot.dataValues.dateRetraitFacture.toLocaleDateString("en-US"),
    ]);
    counter++;
  }

  // New Header and Footer Data Include the table
  var y = 10;
  doc.setLineWidth(2);

  // First Table (Bill Head)

  if (cli != 0) {
    cli = "Client : " + body[0][0];
  } else {
    cli = "";
  }
  //doc.text("Header or footer text", 5, 2);
  doc.autoTable({
    body: [["INDUSTRIAL PRESSING :", titre], [cli]],
    startY: 10,
    theme: "striped",
  });

  // Second table (Bill Body)
  doc.autoTable({
    body: body,
    // startY: 200,
    head: [
      [
        "N°",
        "Client",
        "Tel",
        // "Article",
        "Total(F)",
        "Avance(F)",
        "Rsete(F)",
        "Date depot",
        "Date Retrait",
      ],
    ],
    startY: 30,
    theme: "striped",
  });

  // Third Table (Bill Footer)
  doc.autoTable({
    body: [
      ["Montant Total   :" + t],
      ["Montant Avancé  :" + a],
      ["Montant Restant :" + r],
    ],
    theme: "striped",
  });

  // Forth Table (Bill Last element)
  doc.autoTable({
    body: [[""]],
    styles: {
      font: "courier",
      fontStyle: "bold",
      fontSize: 12,
    },
    theme: "plain",
    columnStyles: {
      0: { halign: "center" },
    },
  });

  // Fifth Table (Bill Signature)
  // doc.autoTable({
  //   body: [["Le Directeur", ""]],
  //   styles: {
  //     font: "courier",
  //     fontStyle: "bold",
  //     minCellHeight: 10,
  //     // fontSize: 12,
  //     cellPadding: {
  //       horizontal: 20,
  //     },
  //   },
  //   theme: "plain",
  //   columnStyles: {
  //     0: { halign: "left", valign: "top" },
  //     1: { halign: "right", valign: "top" },
  //   },
  // });

  addFooters(doc);

  var file_Path =
    "Facture_de_" +
    "data.customer_name" +
    "_du_" +
    year +
    "-" +
    month +
    "-" +
    day +
    "_" +
    "id_facture" +
    ".pdf";

  doc.autoPrint({ variant: "non-conform" });

  doc.save(file_Path);
  var absolutePdfFilePath = resolve(file_Path);

  window.open(absolutePdfFilePath);
};

const generatePDFFile = (data, d, f, titre, cli, t, a, r) => {
  //alert(titre)
  const date = new Date();
  const [month, day, year] = [
    date.getMonth() + 1,
    date.getDate(),
    date.getFullYear(),
  ];
  const [hour, minutes, seconds] = [
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ];

  const addFooters = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    for (var i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        "Page " + String(i) + " / " + String(pageCount),
        doc.internal.pageSize.width / 2,
        287,
        {
          align: "center",
        }
      );
    }
  };

  var doc = new jsPDF();
  //var doc = new jsPDF("p", "pt");

  doc.setFont("courier", "italic");

  // generate the above data table
  var body = [];

  console.log(data);
  counter = 0;

  for (depot of data) {
    //alert(counter)
    // alert(parseFloat(depot.dataValues.montantTotalFacture) -
    // parseFloat(
    //   depot.dataValues.total_reglement
    // ))

    body.push([
      counter + 1,
      depot.dataValues.Client.nomClient,
      depot.dataValues.Client.phoneClient,
      depot.dataValues.montantTotalFacture,
      depot.dataValues.total_reglement ? depot.dataValues.total_reglement : 0,
      parseFloat(depot.dataValues.montantTotalFacture) -
        parseFloat(depot.dataValues.total_reglement),
      depot.dataValues.dateDepotFacture.toLocaleDateString("en-US"),
      depot.dataValues.dateRetraitFacture.toLocaleDateString("en-US"),
    ]);
    counter++;
  }

  // New Header and Footer Data Include the table
  var y = 10;
  doc.setLineWidth(2);

  // First Table (Bill Head)

  if (cli != 0) {
    cli = "Client : " + body[0][0];
  } else {
    cli = "";
  }
  //doc.text("Header or footer text", 5, 2);
  doc.autoTable({
    body: [["INDUSTRIAL PRESSING :", titre], [cli]],
    startY: 10,
    theme: "striped",
  });

  // Second table (Bill Body)
  doc.autoTable({
    body: body,
    // startY: 200,
    head: [
      [
        "N°",
        "Client",
        "Tel",
        // "Article",
        "Total(F)",
        "Avance(F)",
        "Rsete(F)",
        "Date depot",
        "Date Retrait",
      ],
    ],
    startY: 30,
    theme: "striped",
  });

  // Third Table (Bill Footer)
  doc.autoTable({
    body: [
      ["Montant Total   :" + t],
      ["Montant Avancé  :" + a],
      ["Montant Restant :" + r],
    ],
    theme: "striped",
  });

  // Forth Table (Bill Last element)
  doc.autoTable({
    body: [[""]],
    styles: {
      font: "courier",
      fontStyle: "bold",
      fontSize: 12,
    },
    theme: "plain",
    columnStyles: {
      0: { halign: "center" },
    },
  });

  // Fifth Table (Bill Signature)
  // doc.autoTable({
  //   body: [["Le Directeur", ""]],
  //   styles: {
  //     font: "courier",
  //     fontStyle: "bold",
  //     minCellHeight: 10,
  //     // fontSize: 12,
  //     cellPadding: {
  //       horizontal: 20,
  //     },
  //   },
  //   theme: "plain",
  //   columnStyles: {
  //     0: { halign: "left", valign: "top" },
  //     1: { halign: "right", valign: "top" },
  //   },
  // });

  addFooters(doc);

  var file_Path =
    "Facture_de_" +
    "data.customer_name" +
    "_du_" +
    year +
    "-" +
    month +
    "-" +
    day +
    "_" +
    "id_facture" +
    ".pdf";

  doc.autoPrint({ variant: "non-conform" });

  doc.save(file_Path);
  var absolutePdfFilePath = resolve(file_Path);

  window.open(absolutePdfFilePath);
};

// ////////////////////////////////////////////////////////////////////////////// //
// //////////////////////// Controller For ChiffreAffaire //////////////////////////// //
// ////////////////////////////////////////////////////////////////////////////// //

// Function to find all instances of a ChiffreAffaire
async function findAllChiffreAffaire() {
  ChiffreAffaire.findAll()
    .then((data) => {
      let table_body = "";

      // Filling the table with the list of Services
      data
        .reverse()
        .map((item) => {
          table_body += "<tr>";
          table_body +=
            '<th scope="row"><p class="question_content">' +
            item.dataValues.janvierChiffreAffaire +
            "</p></th>";
          table_body +=
            '<th scope="row"><p class="question_content">' +
            item.dataValues.fevrierChiffreAffaire +
            "</p></th>";
          table_body +=
            '<th scope="row"><p class="question_content">' +
            item.dataValues.marsChiffreAffaire +
            "</p></th>";
          table_body +=
            '<th scope="row"><p class="question_content">' +
            item.dataValues.avrilChiffreAffaire +
            "</p></th>";
          table_body +=
            '<th scope="row"><p class="question_content">' +
            item.dataValues.maiChiffreAffaire +
            "</p></th>";
          table_body +=
            '<th scope="row"><p class="question_content">' +
            item.dataValues.juinChiffreAffaire +
            "</p></th>";
          table_body +=
            '<th scope="row"><p class="question_content">' +
            item.dataValues.juilletChiffreAffaire +
            "</p></th>";
          table_body +=
            '<th scope="row"><p class="question_content">' +
            item.dataValues.aoutChiffreAffaire +
            "</p></th>";
          table_body +=
            '<th scope="row"><p class="question_content">' +
            item.dataValues.septembreChiffreAffaire +
            "</p></th>";
          table_body +=
            '<th scope="row"><p class="question_content">' +
            item.dataValues.octobreChiffreAffaire +
            "</p></th>";
          table_body +=
            '<th scope="row"><p class="question_content">' +
            item.dataValues.novembreChiffreAffaire +
            "</p></th>";
          table_body +=
            '<th scope="row"><p class="question_content">' +
            item.dataValues.decembreChiffreAffaire +
            "</p></th>";
        })
        .join();

      // Assigning `table_body` to the table id within the service screen
      document.getElementById("chiffreAffaire_table_body").innerHTML =
        table_body;

      // Loading js files
      var js_ = document.createElement("script");
      js_.type = "text/javascript";
      js_.src = "vendors/datatable/js/jquery.dataTables.min.js";
      js_.id = "firstJSFileChiffreAffaire";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstJSFileChiffreAffaire")) {
        const element = document.getElementById("firstJSFileChiffreAffaire");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondJSFileChiffreAffaire";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondJSFileChiffreAffaire")) {
        const item = document.getElementById("secondJSFileChiffreAffaire");
        item.replaceWith(js);
      } else {
        document.body.appendChild(js);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to find one instance of a ChiffreAffaire
async function findOneChiffreAffaire(data) {
  ChiffreAffaire.findOne()
    .then(() => {})
    .catch((err) => {
      console.log(err);
    });
}

// Function to create an instance of a ChiffreAffaire
async function createChiffreAffaire(data, idChiffreAffaire) {
  ChiffreAffaire.update(data, {
    where: {
      idChiffreAffaire: idChiffreAffaire,
    },
  })
    .then(() => {
      document.getElementById("message").innerHTML =
        '<strong style="color: green;">ChiffreAffaire creer avec succes!</strong>';

      // Loading the new created ChiffreAffaire into the table
      findAllChiffreAffaire();
    })
    .catch((err) => {
      console.log(err);
    });
}

// Functio to update an instance of a ChiffreAffaire
async function updateChiffreAffaire(data, idChiffreAffaire) {
  ChiffreAffaire.update(data, {
    where: {
      idChiffreAffaire: idChiffreAffaire,
    },
  })
    .then(() => {
      // Loading the list of ChiffreAffaires into the table
      findAllChiffreAffaire();
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to delete an instance of a ChiffreAffaire
async function deleteChiffreAffaire(data) {
  ChiffreAffaire.destroy({ where: data })
    .then((response) => {
      // Loading the list of ChiffreAffaires into the table
      findAllChiffreAffaire();
    })
    .catch((err) => {
      console.log(err);
    });
}

// ////////////////////////////////////////////////////////////////////////////// //
// //////////////////////// Controller For Client /////////////////////////////// //
// ////////////////////////////////////////////////////////////////////////////// //

// Function to find all instances of Client
async function findAllClient() {
  Client.findAll()
    .then((data) => {
      let table_body = "";

      // Filling the table with the list of Clients
      data
        .reverse()
        .map((item) => {
          table_body += "<tr>";
          //   First Column
          table_body +=
            '<th scope="row"><p name="line' +
            item.dataValues.idClient +
            '"  class="question_content">' +
            item.dataValues.nomClient +
            '</p><p name="lineU' +
            item.dataValues.idClient +
            '" hidden ><input id="nomClientUpdated' +
            item.dataValues.idClient +
            '" type="text" class="form-control" placeholder="nom" value="' +
            item.dataValues.nomClient +
            '"/></p></th>';
          // Second Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idClient +
            '" >' +
            item.dataValues.sexeClient +
            '</p><p name="lineU' +
            item.dataValues.idClient +
            '" hidden><select id="sexeClientUpdated' +
            item.dataValues.idClient +
            '"class="form-control js-example-basic-single"style="width: 100%;"onchange="" value="' +
            item.dataValues.sexeClient +
            '"><option value="M">M</option><option value="F">F</option></select></p></td>';
          // Third Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idClient +
            '">' +
            item.dataValues.phoneClient +
            '</p><p name="lineU' +
            item.dataValues.idClient +
            '" hidden><input id="phoneClientUpdated' +
            item.dataValues.idClient +
            '" type="number" class="form-control" placeholder="phone" value="' +
            item.dataValues.phoneClient +
            '"/></p></td>';
          // Fourth Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idClient +
            '">' +
            item.dataValues.residenceClient +
            '</p><p name="lineU' +
            item.dataValues.idClient +
            '" hidden><input id="residenceClientUpdated' +
            item.dataValues.idClient +
            '" type="text" class="form-control" placeholder="residence" value="' +
            item.dataValues.residenceClient +
            '"/></p></td>';
          // Fifth Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idClient +
            '">' +
            item.dataValues.reductionClient +
            '</p><p name="lineU' +
            item.dataValues.idClient +
            '" hidden><input id="reductionClientUpdated' +
            item.dataValues.idClient +
            '" type="number" class="form-control" placeholder="reduction" value="' +
            item.dataValues.reductionClient +
            '"/></p></td>';
          // Sixth Column
          table_body +=
            '<td><div onclick="" class="w-50 rounded bg-success text-center"><i class="fa fa-eye"> </i></div></td>';
          // Seventh Column
          table_body += '<td class="d-flex justify-content-evenly">';
          // First button
          table_body +=
            ' <div name="line' +
            item.dataValues.idClient +
            '" onclick="toggleupdateClient(' +
            item.dataValues.idClient +
            ')" class="w-50 rounded bg-info text-center"><i class="fa fa-edit"> </i></div>';
          table_body +=
            ' <div name="lineU' +
            item.dataValues.idClient +
            '" hidden onclick="updateClientController(' +
            item.dataValues.idClient +
            ')" class="w-50 rounded bg-success text-center"><i class="fa fa-save"> </i></div>';
          // Second Button
          table_body +=
            ' <div onclick="deleteClientController(' +
            item.dataValues.idClient +
            ')" class="w-50 rounded bg-danger text-center"><i class="fa fa-trash"> </i></div>';
          table_body += "</td>";
          table_body += "</tr>";
        })
        .join();

      // Assigning `table_body` to the table id within the client screen
      document.getElementById("client_table_body").innerHTML = table_body;

      // Loading js files
      var js_ = document.createElement("script");
      js_.type = "text/javascript";
      js_.src = "vendors/datatable/js/jquery.dataTables.min.js";
      js_.id = "firstJSFileClient";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstJSFileClient")) {
        const element = document.getElementById("firstJSFileClient");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondJSFileClient";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondJSFileClient")) {
        const item = document.getElementById("secondJSFileClient");
        item.replaceWith(js);
      } else {
        document.body.appendChild(js);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to find one instance of a Client
async function findOneClient(data) {
  Client.findOne()
    .then(() => {})
    .catch((err) => {
      console.log(err);
    });
}

// Function to create an instance of a Client
async function createClient(data) {
  console.log(data);
  Client.create(data)
    .then(() => {
      document.getElementById("message").innerHTML =
        '<strong style="color: green;">Client creer avec succes!</strong>';

      // Loading the new created Client into the table
      findAllClient();
    })
    .catch((err) => {
      console.log("your err:" + err);
      console.log(err);
    });
}

// Functio to update an instance of a Client
async function updateClient(data, idClient) {
  Client.update(data, {
    where: {
      idClient: idClient,
    },
  })
    .then(() => {
      // Loading the list of clients into the table
      findAllClient();
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to delete an instance of a Client
async function deleteClient(data) {
  Client.destroy({ where: data })
    .then((response) => {
      // Loading the list of clients into the table
      findAllClient();
    })
    .catch((err) => {
      console.log(err);
    });
}

// ////////////////////////////////////////////////////////////////////////////// //
// //////////////////////// Controller For Depot /////////////////////////////// //
// ////////////////////////////////////////////////////////////////////////////// //

// Function to find all instances of Client
async function findAllClientFacture() {
  Client.findAll()
    .then((data) => {
      let client_name_select = "";
      let client_phone_select = "";

      // Filling the menu select with the list of Clients
      data
        .reverse()
        .map((item) => {
          // First menu select option
          client_name_select +=
            " <option value=" +
            item.dataValues.idClient +
            "#" +
            item.dataValues.reductionClient +
            ">" +
            item.dataValues.nomClient +
            "</option>";
          // Second menu select option
          client_phone_select +=
            "<option value=" +
            item.dataValues.idClient +
            ">" +
            item.dataValues.phoneClient +
            "</option>";
        })
        .join();

      // Assigning `client_name_select` to the select id within the depot screen
      document.getElementById("client_name_select").innerHTML =
        client_name_select;

      // Assigning `client_phone_select` to the select id within the depot screen
      document.getElementById("client_phone_select").innerHTML =
        client_phone_select;
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to find all instances of a Linge
async function findAllLingeFacture(rowIndex) {
  Linge.findAll()
    .then((data) => {
      let clothe_code = "";
      let clothe_type = "";
      let clothe_name = "";
      let clothe_description = "";
      let clothe_priceUnitary = "";
      // Filling the table with the list of Services
      data
        .reverse()
        .map((item) => {
          // First menu select option
          clothe_code +=
            " <option value=" +
            item.dataValues.idLinge +
            ">" +
            item.dataValues.codeLinge +
            "</option>";

          // Second menu select option
          // clothe_type +=
          //   "<option value=" +
          //   item.dataValues.idLinge +
          //   ">" +
          //   item.dataValues.typeLinge +
          //   "</option>";

          // Third menu select option
          clothe_name +=
            " <option value=" +
            item.dataValues.idLinge +
            ">" +
            item.dataValues.designationLinge +
            "</option>";
          // Fourth menu select option
          // clothe_description +=
          //   "<option value=" +
          //   item.dataValues.idLinge +
          //   ">" +
          //   item.dataValues.phoneClient +
          //   "</option>";

          // Fifth menu select option
          clothe_priceUnitary +=
            "<option value=" +
            item.dataValues.montantLinge +
            ">" +
            item.dataValues.montantLinge +
            "</option>";
        })
        .join();
      // Assigning `ligne_row` to row number `rowIndex` within the depot screen
      document.getElementById("clothe_code" + rowIndex).innerHTML = clothe_code;
      // document.getElementById("clothe_type" + rowIndex).innerHTML = clothe_type;
      document.getElementById("clothe_name" + rowIndex).innerHTML = clothe_name;
      // document.getElementById("clothe_description" + rowIndex).innerHTML =
      //   clothe_description;
      document.getElementById("clothe_priceUnitary" + rowIndex).innerHTML =
        clothe_priceUnitary;

      // Loading js files
      if (document.getElementById("firstJSFile")) {
        const element = document.getElementById("firstJSFile");
        element.replaceWith(document.createElement("script"));
      }
      // if (document.getElementById("firstLinge")) {
      //   const element = document.getElementById("firstLinge");
      //   element.replaceWith(document.createElement("script"));
      // }
      // if (document.getElementById("firstJSFile")) {
      //   const element = document.getElementById("firstJSFile");
      //   element.replaceWith(document.createElement("script"));
      // }
      // if (document.getElementById("firstJSFile")) {
      //   const element = document.getElementById("firstJSFile");
      //   element.replaceWith(document.createElement("script"));
      // }
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to find all instances of Service
async function findAllServiceFacture() {
  Service.findAll()
    .then((data) => {
      let service_type = "";

      // Filling the table with the list of Services
      data
        .reverse()
        .map((item) => {
          service_type +=
            " <option value=" +
            item.dataValues.idService +
            "#" +
            item.dataValues.dureeService +
            "*" +
            item.dataValues.tauxService +
            ">" +
            item.dataValues.nomService +
            "</option>";
        })
        .join();

      // Assigning `service_type` to the table id within the service screen
      document.getElementById("service_type").innerHTML = service_type;
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to create an instance of a Facture
async function createFacture(data) {
  Facture.create(data.depotData)
    .then(async (result) => {
      console.log(result);
      if (data.reglementData != 0) {
        console.log("Avance");
        await ReglementFacture.create({
          montantReglementFacture: data.reglementData,
          idFacture: result.dataValues.idFacture,
          dateReglementFacture: new Date(),
        });
      }
      // Add each article in the created `Facture` instance
      let counter = 0;
      data.lingeData.map((element) => {
        console.log("Linge: " + element.idClothe);
        FactureLinge.create({
          idFacture: result.dataValues.idFacture,
          idLinge: element.idClothe,
          descriptionLinge: element.descriptionClothe,
          quantityLinge: element.quantityClothe,
        })
          .then((res) => {
            console.log(res);
            counter++;
            if (counter === data.lingeData.length) {
              document.getElementById("message").innerHTML =
                '<strong style="color: green;">Facture cree avec success!</strong>';
            }
          })
          .catch((error) => {
            console.log("Error FactureLinge: " + error);
          });
      });
    })
    .catch((err) => {
      console.log("Error Facture: " + err);
    });
}

// ////////////////////////////////////////////////////////////////////////////// //
// //////////////////////// Controller For Linge //////////////////////////////// //
// ////////////////////////////////////////////////////////////////////////////// //

// Function to find all instances of a Linge
async function findAllLinge() {
  Linge.findAll()
    .then((data) => {
      let table_body = "";

      // Filling the table with the list of Services
      data
        .reverse()
        .map((item) => {
          table_body += "<tr>";
          //   First Column
          table_body +=
            '<th scope="row"><p name="line' +
            item.dataValues.idLinge +
            '"  class="question_content">' +
            item.dataValues.codeLinge +
            '</p><p name="lineU' +
            item.dataValues.idLinge +
            '" hidden ><input id="codeLingeUpdated' +
            item.dataValues.idLinge +
            '" type="text" class="form-control" placeholder="code" value="' +
            item.dataValues.codeLinge +
            '"/></p></th>';
          // Second Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idLinge +
            '" >' +
            item.dataValues.typeLinge +
            '</p><p name="lineU' +
            item.dataValues.idLinge +
            '" hidden><select id="typeLingeUpdated' +
            item.dataValues.idLinge +
            '"class="form-control js-example-basic-single"style="width: 100%;"onchange="" value="' +
            item.dataValues.typeLinge +
            '"><option value="Hommes">Hommes</option><option value="Femmes">Femmes</option><option value="Divers">Divers</option></select></p></td>';
          // Third Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idLinge +
            '">' +
            item.dataValues.designationLinge +
            '</p><p name="lineU' +
            item.dataValues.idLinge +
            '" hidden><input id="designationLingeUpdated' +
            item.dataValues.idLinge +
            '" type="text" class="form-control" placeholder="designation" value="' +
            item.dataValues.designationLinge +
            '"/></p></td>';
          // Fourth Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idLinge +
            '">' +
            item.dataValues.montantLinge +
            '</p><p name="lineU' +
            item.dataValues.idLinge +
            '" hidden><input id="montantLingeUpdated' +
            item.dataValues.idLinge +
            '" type="number" class="form-control" placeholder="montant" value="' +
            item.dataValues.montantLinge +
            '"/></p></td>';
          // Fifth Column
          table_body += '<td class="d-flex justify-content-evenly">';
          // First button
          table_body +=
            ' <div name="line' +
            item.dataValues.idLinge +
            '" onclick="toggleupdateLinge(' +
            item.dataValues.idLinge +
            ')" class="w-50 rounded bg-info text-center"><i class="fa fa-edit"> </i></div>';
          table_body +=
            ' <div name="lineU' +
            item.dataValues.idLinge +
            '" hidden onclick="updateLingeController(' +
            item.dataValues.idLinge +
            ')" class="w-50 rounded bg-success text-center"><i class="fa fa-save"> </i></div>';
          // Second Button
          table_body +=
            ' <div onclick="deleteLingeController(' +
            item.dataValues.idLinge +
            ')" class="w-50 rounded bg-danger text-center"><i class="fa fa-trash"> </i></div>';
          table_body += "</td>";
          table_body += "</tr>";
        })
        .join();

      // Assigning `table_body` to the table id within the service screen
      document.getElementById("linge_table_body").innerHTML = table_body;

      // Loading js files
      var js_ = document.createElement("script");
      js_.type = "text/javascript";
      js_.src = "vendors/datatable/js/jquery.dataTables.min.js";
      js_.id = "firstJSFileLinge";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstJSFileLinge")) {
        const element = document.getElementById("firstJSFileLinge");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondJSFileLinge";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondJSFileLinge")) {
        const item = document.getElementById("secondJSFileLinge");
        item.replaceWith(js);
      } else {
        document.body.appendChild(js);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to find one instance of a Linge
async function findOneLinge(data) {
  Linge.findOne()
    .then(() => {})
    .catch((err) => {
      console.log(err);
    });
}

// Function to create an instance of a Linge
async function createLinge(data) {
  Linge.create(data)
    .then(() => {
      document.getElementById("message").innerHTML =
        '<strong style="color: green;">Linge creer avec succes!</strong>';

      // Loading the new created Linge into the table
      findAllLinge();
    })
    .catch((err) => {
      console.log(err);
    });
}

// Functio to update an instance of a Linge
async function updateLinge(data, idLinge) {
  Linge.update(data, {
    where: {
      idLinge: idLinge,
    },
  })
    .then(() => {
      // Loading the list of Linges into the table
      findAllLinge();
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to delete an instance of a Linge
async function deleteLinge(data) {
  Linge.destroy({ where: data })
    .then((response) => {
      // Loading the list of Linges into the table
      findAllLinge();
    })
    .catch((err) => {
      console.log(err);
    });
}

// ////////////////////////////////////////////////////////////////////////////// //
// //////////////////////// Controller For Operateur //////////////////////////// //
// ////////////////////////////////////////////////////////////////////////////// //

// Function to find all instances of a Operateur
async function findAllOperateur() {
  Operateur.findAll()
    .then((data) => {
      let table_body = "";

      // Filling the table with the list of Services
      data
        .reverse()
        .map((item) => {
          table_body += "<tr>";
          //   First Column
          table_body +=
            '<th scope="row"><p name="line' +
            item.dataValues.idOperateur +
            '"  class="question_content">' +
            item.dataValues.nameOperateur +
            '</p><p name="lineU' +
            item.dataValues.idOperateur +
            '" hidden ><input id="nameOperateurUpdated' +
            item.dataValues.idOperateur +
            '" type="text" class="form-control" placeholder="nom" value="' +
            item.dataValues.nameOperateur +
            '"/></p></th>';
          // Second Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idOperateur +
            '" >' +
            item.dataValues.fonctionOperateur +
            '</p><p name="lineU' +
            item.dataValues.idOperateur +
            '" hidden><select id="fonctionOperateurUpdated' +
            item.dataValues.idOperateur +
            '"class="form-control js-example-basic-single"style="width: 100%;"onchange="" value="' +
            item.dataValues.fonctionOperateur +
            '"><option value="Administrateur">Administrateur</option><option value="Receptioniste">Receptioniste</option></select></p></td>';
          // Third Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idOperateur +
            '">' +
            item.dataValues.phoneOperateur +
            '</p><p name="lineU' +
            item.dataValues.idOperateur +
            '" hidden><input id="phoneOperateurUpdated' +
            item.dataValues.idOperateur +
            '" type="number" class="form-control" placeholder="contact" value="' +
            item.dataValues.phoneOperateur +
            '"/></p></td>';
          // Fourth Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idOperateur +
            '">' +
            item.dataValues.loginOperateur +
            '</p><p name="lineU' +
            item.dataValues.idOperateur +
            '" hidden><input id="loginOperateurUpdated' +
            item.dataValues.idOperateur +
            '" type="text" class="form-control" placeholder="login" value="' +
            item.dataValues.loginOperateur +
            '"/></p></td>';
          // Fifth Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idOperateur +
            '">...........</p><p name="lineU' +
            item.dataValues.idOperateur +
            '" hidden><input id="passwordOperateurUpdated' +
            item.dataValues.idOperateur +
            '" type="password" class="form-control" placeholder="mot de passe" value="' +
            item.dataValues.passwordOperateur +
            '"/></p></td>';
          // Sixth Column
          table_body += '<td class="d-flex justify-content-evenly">';
          // First button
          table_body +=
            ' <div name="line' +
            item.dataValues.idOperateur +
            '" onclick="toggleupdateOperateur(' +
            item.dataValues.idOperateur +
            ')" class="w-50 rounded bg-info text-center"><i class="fa fa-edit"> </i></div>';
          table_body +=
            ' <div name="lineU' +
            item.dataValues.idOperateur +
            '" hidden onclick="updateOperateurController(' +
            item.dataValues.idOperateur +
            ')" class="w-50 rounded bg-success text-center"><i class="fa fa-save"> </i></div>';
          // Second Button
          table_body +=
            ' <div onclick="deleteOperateurController(' +
            item.dataValues.idOperateur +
            ')" class="w-50 rounded bg-danger text-center"><i class="fa fa-trash"> </i></div>';
          table_body += "</td>";
          table_body += "</tr>";
        })
        .join();

      // Assigning `table_body` to the table id within the service screen
      document.getElementById("operateur_table_body").innerHTML = table_body;

      // Loading js files
      var js_ = document.createElement("script");
      js_.type = "text/javascript";
      js_.src = "vendors/datatable/js/jquery.dataTables.min.js";
      js_.id = "firstJSFileOperateur";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstJSFileOperateur")) {
        const element = document.getElementById("firstJSFileOperateur");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondJSFileOperateur";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondJSFileOperateur")) {
        const item = document.getElementById("secondJSFileOperateur");
        item.replaceWith(js);
      } else {
        document.body.appendChild(js);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to find one instance of a Operateur
async function findOneOperateur(data) {
  Operateur.findOne()
    .then(() => {})
    .catch((err) => {
      console.log(err);
    });
}

// Function to create an instance of a Operateur
async function createOperateur(data) {
  Operateur.create(data)
    .then(() => {
      document.getElementById("message").innerHTML =
        '<strong style="color: green;">Operateur creer avec succes!</strong>';

      // Loading the new created operateur into the table
      findAllOperateur();
    })
    .catch((err) => {
      console.log(err);
    });
}

// Functio to update an instance of a Operateur
async function updateOperateur(data, idOperateur) {
  Operateur.update(data, {
    where: {
      idOperateur: idOperateur,
    },
  })
    .then(() => {
      // Loading the list of operateurs into the table
      findAllOperateur();
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to delete an instance of a Operateur
async function deleteOperateur(data) {
  Operateur.destroy({ where: data })
    .then((response) => {
      // Loading the list of operateurs into the table
      findAllOperateur();
    })
    .catch((err) => {
      console.log(err);
    });
}

// ////////////////////////////////////////////////////////////////////////////// //
// //////////////////////// Controller For Retraits ///////////////////////////// //
// ////////////////////////////////////////////////////////////////////////////// //

// Function to find all instances of Facture
async function findAllRetraits(pickedMonth, pickedYear) {
  Facture.findAll({
    attributes: {},
    include: [
      {
        model: Client,
        attributes: ["nomClient", "phoneClient"],
      },
      Linge,
      ReglementFacture,
      Service,
    ],
    where: {
      [Op.and]: [
        sequelize.where(
          sequelize.fn("date", sequelize.col("dateDepotFacture")),
          ">=",
          sequelize.fn("date", new Date(pickedYear, pickedMonth - 1, 1))
        ),
        sequelize.where(
          sequelize.fn("date", sequelize.col("dateDepotFacture")),
          "<=",
          sequelize.fn("date", new Date(pickedYear, pickedMonth, 0))
        ),
        { etatFacture: true },
      ],
    },
    order: [["dateDepotFacture", "DESC"]],
    group: [
      // "Facture.idFacture",
      // "Client.idClient",
      // "Service.idService",
      // "ReglementFactures.idReglementFacture",
    ],
  })
    .then(async (data) => {
      // console.log(data);
      let retrait_table_body = "";
      // Overview on list of Factures
      // ::::::::::::::::: Total Depots
      document.getElementById("depots_total").innerHTML = data.length;
      // ::::::::::::::::: Total Clients
      document.getElementById("totalClient").innerHTML = new Set(
        data.map((item) => item.dataValues.idClient)
      ).size;
      // ::::::::::::::::: Total Depots Amount
      let totalAmount = parseFloat(
        data.reduce(
          (sum, element) => sum + element.dataValues.montantTotalFacture,
          0
        )
      ).toLocaleString();
      document.getElementById("totalDepotsAmount").innerHTML =
        totalAmount.toLocaleString() + " FCFA";
      // Filling the table with the list of Factures
      data
        // .reverse()
        .map(async (item, index) => {
          retrait_table_body += "<tr>";
          retrait_table_body += "<td>" + (index + 1) + "</td>";
          retrait_table_body += '<th scope="row">';
          retrait_table_body +=
            '<a href="#" class="question_content">' +
            item.Client.nomClient +
            "\n(" +
            item.Client.phoneClient +
            ")" +
            "</a>";
          retrait_table_body += "</th>";
          retrait_table_body += `<td>${item.dataValues.idFacture}#${new Date(
            item.dataValues.dateDepotFacture
          )
            .getFullYear()
            .toString()
            .slice(-2)} </td>`;
          retrait_table_body +=
            "<td>" +
            item.dataValues.montantTotalFacture.toLocaleString() +
            "</td>";
          retrait_table_body +=
            "<td>" +
            item.dataValues.dateDepotFacture.toISOString().split("T")[0] +
            "</td>";
          retrait_table_body +=
            "<td>" +
            item.dataValues.dateRetraitFacture.toISOString().split("T")[0] +
            "</td>";
          // // First Button
          // retrait_table_body +=
          //   '<td><button id="updateButton_0" name="updateButtonName" onclick="toggleUpdateReglementFacture(' +
          //   item.dataValues.idFacture +
          //   "," +
          //   (parseFloat(item.dataValues.montantTotalFacture) -
          //     (item.dataValues.total_reglement
          //       ? parseFloat(item.dataValues.total_reglement)
          //       : 0)) +
          //   ')" class="btn btn-success btn-md text_white" role="button">Payer</button>';
          // // Second Button
          // retrait_table_body +=
          //   '<button onclick="" class="btn btn-danger btn-md text_white" role="button">Supp&nbsp;</button>';

          retrait_table_body += "</td></tr>";
        })
        .join();

      // Assigning `table_body` to the table id within the retrait screen
      document.getElementById("retrait_table_body").innerHTML =
        retrait_table_body;

      // Loading js files
      js_ = document.createElement("script");
      js_.type = "text/javascript";
      js_.src = "vendors/datatable/js/jquery.dataTables.min.js";
      js_.id = "firstJSRetrait";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstJSRetrait")) {
        const element = document.getElementById("firstJSRetrait");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondJSRetrait";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondJSRetrait")) {
        const item = document.getElementById("secondJSRetrait");
        item.replaceWith(js);
      } else {
        document.body.appendChild(js);
      }
    })
    .catch((err) => {
      console.log(err);
      console.log("yo: " + err);
    });
}

// ////////////////////////////////////////////////////////////////////////////// //
// //////////////////////// Controller For Depots Effectues ///////////////////// //
// ////////////////////////////////////////////////////////////////////////////// //

// Function to find all instances of Facture
async function findAllFacture(pickedDate, phoneClient) {
  Facture.findAll({
    attributes: {},
    include: [
      {
        model: Client,
        attributes: ["nomClient", "phoneClient"],
        where: phoneClient
          ? {
              phoneClient: phoneClient,
            }
          : {},
      },
      Linge,
      ReglementFacture,
      Service,
    ],
    where: {
      [Op.and]: [
        sequelize.where(
          sequelize.fn("date", sequelize.col("dateDepotFacture")),
          "=",
          sequelize.fn("date", new Date(pickedDate))
        ),
        { etatFacture: false },
      ],
    },
    order: [["idFacture", "ASC"]],
    group: [
      // "Facture.idFacture",
      // "Client.idClient",
      // "Service.idService",
      // "ReglementFactures.idReglementFacture",
    ],
  })
    .then(async (data) => {
      console.log(data);
      let depots_effectues_table_body = "";
      // Overview on list of Factures
      // ::::::::::::::::: Total Depots
      document.getElementById("depots_total").innerHTML = data.length;
      // ::::::::::::::::: Total Clients
      document.getElementById("totalClient").innerHTML = new Set(
        data.map((item) => item.dataValues.idClient)
      ).size;
      // ::::::::::::::::: Total Depots Amount
      let totalAmount = parseFloat(
        data.reduce(
          (sum, element) => sum + element.dataValues.montantTotalFacture,
          0
        )
      );
      document.getElementById("totalDepotsAmount").innerHTML =
        totalAmount.toLocaleString() + " FCFA";
      // ::::::::::::::::: Total Avance Amount (Reglement Facture)
      let totalReglementFactureAmount = parseFloat(
        data.reduce(
          (sum, element) =>
            sum +
            element.dataValues.ReglementFactures.reduce(
              (sum, el) => sum + el.dataValues.montantReglementFacture,
              0
            ),
          0
        )
      );
      document.getElementById("totalReglementFactureAmount").innerHTML =
        totalReglementFactureAmount.toLocaleString() + " FCFA";
      // ::::::::::::::::: Total Remaining Amount
      document.getElementById("totalRemainingAmount").innerHTML =
        parseFloat(totalAmount - totalReglementFactureAmount).toLocaleString() +
        " FCFA";
      // Filling the table with the list of Factures
      data
        // .reverse()
        .map(async (item, index) => {
          let data = item.dataValues;
          depots_effectues_table_body += "<tr>";
          depots_effectues_table_body += "<td>" + (index + 1) + "</td>";
          depots_effectues_table_body += '<th scope="row">';
          depots_effectues_table_body +=
            '<a href="#" class="question_content">' +
            item.Client.nomClient +
            "\n(" +
            item.Client.phoneClient +
            ")" +
            "</a>";
          depots_effectues_table_body += "</th>";
          depots_effectues_table_body += `<td>${
            item.dataValues.idFacture
          }#${new Date(item.dataValues.dateDepotFacture)
            .getFullYear()
            .toString()
            .slice(-2)} </td>`;
          depots_effectues_table_body +=
            "<td>" +
            item.dataValues.montantTotalFacture.toLocaleString() +
            "</td>";
          depots_effectues_table_body +=
            '<td><div name="line' +
            item.dataValues.idFacture +
            '">' +
            (item.dataValues.ReglementFactures.length !== 0
              ? parseFloat(
                  item.dataValues.ReglementFactures.reduce(
                    (sum, element) =>
                      sum + element.dataValues.montantReglementFacture,
                    0
                  )
                ).toLocaleString()
              : 0) +
            '</div><input id="reglementFactureUpdate' +
            item.dataValues.idFacture +
            '" type="number" class="form-control" placeholder="avance" value="0" name="lineU' +
            item.dataValues.idFacture +
            '" hidden/></td>';
          depots_effectues_table_body +=
            "<td>" +
            (
              parseFloat(item.dataValues.montantTotalFacture) -
              (item.dataValues.ReglementFactures.length !== 0
                ? parseFloat(
                    item.dataValues.ReglementFactures.reduce(
                      (sum, element) =>
                        sum + element.dataValues.montantReglementFacture,
                      0
                    )
                  )
                : 0)
            ).toLocaleString() +
            "</td>";
          depots_effectues_table_body +=
            "<td>" +
            item.dataValues.dateDepotFacture.toLocaleDateString("en-GB") +
            "</td>";
          depots_effectues_table_body +=
            "<td>" +
            item.dataValues.dateRetraitFacture.toLocaleDateString("en-GB") +
            "</td>";
          // First Button
          depots_effectues_table_body +=
            parseFloat(item.dataValues.montantTotalFacture) -
              (item.dataValues.ReglementFactures.length !== 0
                ? parseFloat(
                    item.dataValues.ReglementFactures.reduce(
                      (sum, element) =>
                        sum + element.dataValues.montantReglementFacture,
                      0
                    )
                  )
                : 0) ===
            0
              ? '<td><button name="line' +
                item.dataValues.idFacture +
                '" id="updateButton_0" name="updateButtonName" onclick="updateFactureRetrait(' +
                item.dataValues.idFacture +
                ')" class="btn btn-danger btn-md text_white" role="button"><i class="fas fa-gift"></i></button>' // Withdraw
              : '<td><button name="line' +
                item.dataValues.idFacture +
                '" id="updateButton_0" name="updateButtonName" onclick="toggleUpdateReglementFacture(' +
                item.dataValues.idFacture +
                ')" class="btn btn-success btn-md text_white" role="button"><i class="fas fa-cash-register"></i></button>'; // Pay
          depots_effectues_table_body +=
            ' <button name="lineU' +
            item.dataValues.idFacture +
            '" hidden onclick="updateFactureController(' +
            item.dataValues.idFacture +
            "," +
            (parseFloat(item.dataValues.montantTotalFacture) -
              (item.dataValues.ReglementFactures.length !== 0
                ? parseFloat(
                    item.dataValues.ReglementFactures.reduce(
                      (sum, item) =>
                        sum + item.dataValues.montantReglementFacture,
                      0
                    )
                  )
                : 0)) +
            ')" class="btn btn-success btn-md text_white"><i class="fa fa-save"></i></button>'; // Save payment

          // Second Button
          depots_effectues_table_body +=
            '<button name="line' +
            item.dataValues.idFacture +
            '" id="printButton' +
            item.dataValues.idFacture +
            '" onclick="printFacture(' +
            item.dataValues.idFacture +
            ')" class="btn btn-primary btn-md text_white" role="button"><i class="fas fa-print"></i></button>'; // Print Invoice

          depots_effectues_table_body += "</td></tr>";
        })
        .join();

      // Assigning `table_body` to the table id within the retrait screen
      document.getElementById("depots_effectues_table_body").innerHTML =
        depots_effectues_table_body;

      // Loading js files
      js_ = document.createElement("script");
      js_.type = "text/javascript";
      js_.src = "vendors/datatable/js/jquery.dataTables.min.js";
      js_.id = "firstJSRetrait";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstJSRetrait")) {
        const element = document.getElementById("firstJSRetrait");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondJSRetrait";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondJSRetrait")) {
        const item = document.getElementById("secondJSRetrait");
        item.replaceWith(js);
      } else {
        document.body.appendChild(js);
      }
    })
    .catch((err) => {
      console.log(err);
      console.log("yo: " + err);
    });
}

// Function to update an instance of Facture (Reglement Facture)
async function updateReglementFacture(data, remainingAmount) {
  const updateReglementFacture = await ReglementFacture.create(data);
  // console.log(updateReglementFacture)
  // if (
  //   updateReglementFacture &&
  //   remainingAmount === data.montantReglementFacture
  // ) {
  //   await Facture.update(
  //     {
  //       etatFacture: true,
  //     },
  //     {
  //       where: {
  //         idFacture: data.idFacture,
  //       },
  //     }
  //   );
  // }
  if (updateReglementFacture) {
    if (document.getElementById("pickedDate").value != "") {
      var pickedDate = new Date(document.getElementById("pickedDate").value);
      findAllFacture(pickedDate.setDate(pickedDate.getDate() + 1));
    } else findAllFacture(Date());

    await generateFacturePDFFile(
      data.idFacture,
      `printButton${data.idFacture}`
    );
  }
}

// Function to update an instance of Facture (Retrait Facture)
async function updateFactureRetrait(id_facture) {
  // Update all Linges to be Retrait
  let lingeUpdated = await FactureLinge.update(
    { withdrewLinge: true },
    {
      where: {
        idFacture: id_facture,
      },
    }
  );
  if (lingeUpdated)
    // Update Facture with the date of Retrait
    await Facture.update(
      {
        dateRetraitFacture: new Date(), // Set the date of Retrait to now
        etatFacture: true, // Set the Facture as Retrait
      },
      {
        where: {
          idFacture: id_facture,
        },
      }
    )
      .then(() => {
        // Loading the list of Factures into the table
        if (document.getElementById("pickedDate").value != "") {
          var pickedDate = new Date(
            document.getElementById("pickedDate").value
          );
          findAllFacture(pickedDate.setDate(pickedDate.getDate() + 1));
        } else findAllFacture(Date());
      })
      .catch((err) => {
        console.log(err);
      });
}

// Function to create Facture pdf to print
async function generateFacturePDFFile(id_facture, printButtonId) {
  console.log(typeof id_facture);
  let factureData = await Facture.findOne({
    where: {
      idFacture: id_facture,
    },
    attributes: {},
    include: [
      {
        model: Client,
        attributes: ["nomClient", "phoneClient"],
      },
      // Linge,
      ReglementFacture,
      Service,
    ],
    group: [
      // "Facture.idFacture",
      // "Client.idClient",
      // "Service.idService",
      // "ReglementFactures.idReglementFacture",
      // "Linges.idLinge",
      // "Linges->FactureLinge.idFactureLinge",
    ],
  });
  console.log(factureData);

  let lingData = await FactureLinge.findAll({
    where: {
      idFacture: id_facture,
    },
    attributes: {},
    include: Linge,
  });
  console.log(lingData);

  //alert(titre)
  const date = new Date();
  const [month, day, year] = [
    date.getMonth() + 1,
    date.getDate(),
    date.getFullYear(),
  ];
  const [hour, minutes, seconds] = [
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ];

  const addFooters = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    // doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    for (var i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        "Page " + String(i) + " / " + String(pageCount),
        doc.internal.pageSize.width / 2,
        287,
        {
          align: "center",
        }
      );
    }
  };

  var doc = new jsPDF("p");

  // New Header and Footer Data Include the table
  var y = 10;
  doc.setLineWidth(2);

  //doc.text("Header", 5, 2);
  doc.autoTable({
    body: [
      [
        `Agence: Boumdjere\nDEPOT du: ${new Date(
          factureData.dataValues.dateDepotFacture
        ).toLocaleDateString("en-GB")} No Facture: ${
          factureData.dataValues.idFacture
        }#${new Date(factureData.dataValues.dateDepotFacture)
          .getFullYear()
          .toString()
          .slice(-2)}`,
        "",
        `Agence: Boumdjere\nDEPOT du: ${new Date(
          factureData.dataValues.dateDepotFacture
        ).toLocaleDateString("en-GB")} No Facture: ${
          factureData.dataValues.idFacture
        }#${new Date(factureData.dataValues.dateDepotFacture)
          .getFullYear()
          .toString()
          .slice(-2)}`,
      ],
    ],
    // startY: 9,
    theme: "plain",
    styles: {
      font: "courier",
      fontStyle: "bold",
      fontSize: 10,
      // lineWidth: 0.5,
      // lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: {
        // cellWidth: 15,
      },
      1: {
        cellWidth: 25,
      },
      2: {
        // cellWidth: 20,
      },
    },
  });

  doc.autoTable({
    body: [
      [
        "",
        factureData.dataValues.Client.nomClient.toUpperCase(),
        factureData.dataValues.Client.phoneClient,
        "",
        factureData.dataValues.Client.nomClient.toUpperCase(),
        factureData.dataValues.Client.phoneClient,
      ],
    ],
    startY: 23,
    theme: "plain",
    styles: {
      font: "courier",
      fontStyle: "bold",
      fontSize: 10,
      // lineWidth: 0.5,
      // lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: {
        cellWidth: 15,
      },
      1: {
        cellWidth: 45,
      },
      2: {
        // cellWidth: 20,
      },
      3: {
        cellWidth: 25,
      },
      4: {
        cellWidth: 45,
      },
      5: {
        // cellWidth: 20,
      },
    },
  });

  // ================> Second table (Bill Body)
  // generate the above data table
  var body = []; // The set of LINGE data
  for (var linge of lingData) {
    body.push([
      linge.dataValues.quantityLinge,
      linge.dataValues.descriptionLinge.toLowerCase() != "ras"
        ? linge.Linge.dataValues.designationLinge.toUpperCase() +
          " " +
          linge.dataValues.descriptionLinge.toLowerCase() +
          " "
        : linge.Linge.dataValues.designationLinge.toUpperCase(),
      linge.Linge.dataValues.montantLinge,
      "",
      linge.dataValues.quantityLinge,
      linge.dataValues.descriptionLinge.toLowerCase() != "ras"
        ? linge.Linge.dataValues.designationLinge.toUpperCase() +
          " " +
          linge.dataValues.descriptionLinge.toLowerCase() +
          " "
        : linge.Linge.dataValues.designationLinge.toUpperCase(),
      linge.Linge.dataValues.montantLinge,
    ]);
  }

  doc.autoTable({
    body: body,
    startY: 45,
    startX: 20,
    theme: "plain",
    styles: {
      font: "courier",
      fontStyle: "bold",
      fontSize: 10,
      // lineWidth: 0.5,
      // lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: {
        cellWidth: 15,
        halign: "center",
        valign: "top",
      },
      1: {
        cellWidth: 50,
      },
      2: {
        // cellWidth: 20,
        halign: "right",
      },
      3: {
        cellWidth: 20,
      },
      4: {
        cellWidth: 15,
        halign: "center",
        valign: "top",
      },
      5: {
        cellWidth: 50,
      },
      6: {
        // cellWidth: 50,
        halign: "right",
      },
    },
  });

  // ================> Third Table (Bill Footer)
  doc.autoTable({
    body: [
      [
        "",
        "Total",
        factureData.dataValues.montantTotalFacture,
        "",
        "",
        "Total",
        factureData.dataValues.montantTotalFacture,
      ],
      // [
      //   "",
      //   `Service : ${
      //     factureData.dataValues.Service.dataValues.nomService
      //   }\nRDV : ${new Date(
      //     factureData.dataValues.dateRetraitFacture
      //   ).toLocaleDateString(
      //     "en-GB"
      //   )}\nAvance : ${factureData.dataValues.ReglementFactures.reduce(
      //     (sum, element) => sum + element.dataValues.montantReglementFacture,
      //     0
      //   )}FCFA`,
      //   "",
      //   "",
      //   "",
      //   `Service : ${
      //     factureData.dataValues.Service.dataValues.nomService
      //   }\nRDV : ${new Date(
      //     factureData.dataValues.dateRetraitFacture
      //   ).toLocaleDateString(
      //     "en-GB"
      //   )}\nAvance : ${factureData.dataValues.ReglementFactures.reduce(
      //     (sum, element) => sum + element.dataValues.montantReglementFacture,
      //     0
      //   )}FCFA`,
      //   "",
      // ],
    ],
    theme: "plain",
    // startY: 40,
    styles: {
      font: "courier",
      fontStyle: "bold",
      fontSize: 10,
      // lineWidth: 0.5,
      // lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: {
        cellWidth: 15,
      },
      1: {
        cellWidth: 50,
      },
      2: {
        // cellWidth: 20,
      },
      3: {
        cellWidth: 20,
      },
      4: {
        cellWidth: 15,
      },
      5: {
        cellWidth: 50,
      },
      6: {
        // cellWidth: 20,
      },
    },
  });

  // ================> Forth Table (Bill Last element)
  doc.autoTable({
    body: [
      [
        `AVANCE: ${factureData.dataValues.ReglementFactures.reduce(
          (sum, element) => sum + element.dataValues.montantReglementFacture,
          0
        )}FCFA | RESTE: ${
          parseInt(factureData.dataValues.montantTotalFacture) -
          factureData.dataValues.ReglementFactures.reduce(
            (sum, element) => sum + element.dataValues.montantReglementFacture,
            0
          )
        }FCFA\nService: ${
          factureData.dataValues.Service.dataValues.nomService
        } | RDV : ${new Date(factureData.dataValues.dateRetraitFacture)
          .toLocaleDateString("en-GB")
          .toString()
          .replace("/20", "/")}\n\nR.C. 062/2002-2003\nCONT. P036300366750Y`,
        "",
        `AVANCE: ${factureData.dataValues.ReglementFactures.reduce(
          (sum, element) => sum + element.dataValues.montantReglementFacture,
          0
        )}FCFA | RESTE: ${
          parseInt(factureData.dataValues.montantTotalFacture) -
          factureData.dataValues.ReglementFactures.reduce(
            (sum, element) => sum + element.dataValues.montantReglementFacture,
            0
          )
        }FCFA\nService: ${
          factureData.dataValues.Service.dataValues.nomService
        } | RDV : ${new Date(factureData.dataValues.dateRetraitFacture)
          .toLocaleDateString("en-GB")
          .toString()
          .replace("/20", "/")}\n\nR.C.062/2002-2003\nCONT.P036300366750Y`,
      ],
    ],
    startY: 120,
    theme: "plain",
    styles: {
      font: "courier",
      fontStyle: "bold",
      fontSize: 10,
      // lineWidth: 0.5,
      // lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: {
        // cellWidth: 15,
      },
      1: {
        cellWidth: 25,
      },
      2: {
        // cellWidth: 20,
      },
    },
  });

  // addFooters(doc);

  var file_Path =
    "Facture_de_" +
    factureData.dataValues.Client.nomClient +
    "_du_" +
    year +
    "-" +
    month +
    "-" +
    day +
    "_" +
    factureData.dataValues.idFacture +
    ".pdf";

  doc.autoPrint({ variant: "non-conform" });

  doc.save(file_Path);
  var absolutePdfFilePath = resolve(file_Path);

  window.open(absolutePdfFilePath);
  document.getElementById(printButtonId).innerHTML =
    '<i class="fas fa-print"></i>';
  return;
}

// ////////////////////////////////////////////////////////////////////////////// //
// //////////////////////// Controller For Service ////////////////////////////// //
// ////////////////////////////////////////////////////////////////////////////// //

// Function to find all instances of a Service
async function findAllService() {
  Service.findAll()
    .then((data) => {
      let table_body = "";

      // Filling the table with the list of Services
      data
        .reverse()
        .map((item) => {
          table_body += "<tr>";
          //   First Column
          table_body +=
            '<th scope="row"><p name="line' +
            item.dataValues.idService +
            '"  class="question_content">' +
            item.dataValues.nomService +
            '</p><p name="lineU' +
            item.dataValues.idService +
            '" hidden ><input id="nomServiceUpdated' +
            item.dataValues.idService +
            '" type="text" class="form-control" placeholder="nom" value="' +
            item.dataValues.nomService +
            '"/></p></th>';
          // Second Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idService +
            '" >' +
            item.dataValues.descriptionService +
            '</p><p name="lineU' +
            item.dataValues.idService +
            '" hidden><input id="descriptionServiceUpdated' +
            item.dataValues.idService +
            '" type="text" class="form-control" placeholder="designation" value="' +
            item.dataValues.descriptionService +
            '"/></p></td>';
          // Third Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idService +
            '">' +
            item.dataValues.dureeService +
            '</p><p name="lineU' +
            item.dataValues.idService +
            '" hidden><input id="dureeServiceUpdated' +
            item.dataValues.idService +
            '" type="text" class="form-control" placeholder="duree" value="' +
            item.dataValues.dureeService +
            '"/></p></td>';
          // Fourth Column
          table_body +=
            '<td><p name="line' +
            item.dataValues.idService +
            '">' +
            item.dataValues.tauxService +
            '</p><p name="lineU' +
            item.dataValues.idService +
            '" hidden><input id="tauxServiceUpdated' +
            item.dataValues.idService +
            '" type="text" class="form-control" placeholder="taux" value="' +
            item.dataValues.tauxService +
            '"/></p></td>';
          // Fifth Column
          table_body += '<td class="d-flex justify-content-evenly">';
          // First button
          table_body +=
            ' <div name="line' +
            item.dataValues.idService +
            '" onclick="toggleupdateService(' +
            item.dataValues.idService +
            ')" class="w-50 rounded bg-info text-center"><i class="fa fa-edit"> </i></div>';
          table_body +=
            ' <div name="lineU' +
            item.dataValues.idService +
            '" hidden onclick="updateServiceController(' +
            item.dataValues.idService +
            ')" class="w-50 rounded bg-success text-center"><i class="fa fa-save"> </i></div>';
          // Second Button
          table_body +=
            ' <div onclick="deleteServiceController(' +
            item.dataValues.idService +
            ')" class="w-50 rounded bg-danger text-center"><i class="fa fa-trash"> </i></div>';
          table_body += "</td>";
          table_body += "</tr>";
        })
        .join();

      // Assigning `table_body` to the table id within the service screen
      document.getElementById("service_table_body").innerHTML = table_body;

      // Loading js files
      var js_ = document.createElement("script");
      js_.type = "text/javascript";
      js_.src = "vendors/datatable/js/jquery.dataTables.min.js";
      js_.id = "firstJSFileService";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstJSFileService")) {
        const element = document.getElementById("firstJSFileService");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondJSFileService";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondJSFileService")) {
        const item = document.getElementById("secondJSFileService");
        item.replaceWith(js);
      } else {
        document.body.appendChild(js);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to find one instance of a Service
async function findOneService(data) {
  Service.findOne()
    .then(() => {})
    .catch((err) => {
      console.log(err);
    });
}

// Function to create an instance of a Service
async function createService(data) {
  Service.create(data)
    .then(() => {
      document.getElementById("message").innerHTML =
        '<strong style="color: green;">Service creer avec succes!</strong>';

      // Loading the new created service into the table
      findAllService();
    })
    .catch((err) => {
      console.log(err);
    });
}

// Functio to update an instance of a Service
async function updateService(data, idService) {
  Service.update(data, {
    where: {
      idService: idService,
    },
  })
    .then(() => {
      // Loading the list of services into the table
      findAllService();
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to delete an instance of a Service
async function deleteService(data) {
  Service.destroy({ where: data })
    .then((response) => {
      // Loading the list of services into the table
      findAllService();
    })
    .catch((err) => {
      console.log(err);
    });
}

contextBridge.exposeInMainWorld("electron", {
  // Function to Manage user Log IN / OUT
  login: login,
  // function for dashboard statistics elements
  findStatistics: findStatistics,
  Printing_chart: Printing_chart,
  // function for  creances_client
  findAllCreances: findAllCreances,
  findAllCreances_CHF: findAllCreances_CHF,
  findAllCreancesByExercieYear: findAllCreancesByExercieYear,
  findAllClient_Creances: findAllClient_Creances,
  generate_Creances_PDFFile_CHF: generate_Creances_PDFFile_CHF,
  generate_Creances_PDFFile: generate_Creances_PDFFile,
  // Functions to Manage Operateur
  findAllChiffreAffaire: findAllChiffreAffaire,
  findOneChiffreAffaire: findOneChiffreAffaire,
  createChiffreAffaire: createChiffreAffaire,
  updateChiffreAffaire: updateChiffreAffaire,
  deleteChiffreAffaire: deleteChiffreAffaire,
  // Functions to Manage Client
  findAllClient: findAllClient,
  findOneClient: findOneClient,
  createClient: createClient,
  updateClient: updateClient,
  deleteClient: deleteClient,
  // Function to Manage Facture (`Depot`)
  findAllClientFacture: findAllClientFacture,
  findAllLingeFacture: findAllLingeFacture,
  findAllServiceFacture: findAllServiceFacture,
  createFacture: createFacture,
  // Functions to Manage Linge
  findAllLinge: findAllLinge,
  findOneLinge: findOneLinge,
  createLinge: createLinge,
  updateLinge: updateLinge,
  deleteLinge: deleteLinge,
  generateFacturePDFFile: generateFacturePDFFile,
  // Functions to Manage Operateur
  findAllOperateur: findAllOperateur,
  findOneOperateur: findOneOperateur,
  createOperateur: createOperateur,
  updateOperateur: updateOperateur,
  deleteOperateur: deleteOperateur,
  // Function to Manage Retraits
  findAllRetraits: findAllRetraits,
  // Function to Manage Depots Effectues
  findAllFacture: findAllFacture,
  updateReglementFacture: updateReglementFacture,
  updateFactureRetrait: updateFactureRetrait,
  // Functions to Manage Service
  findAllService: findAllService,
  findOneService: findOneService,
  createService: createService,
  updateService: updateService,
  deleteService: deleteService,
});
