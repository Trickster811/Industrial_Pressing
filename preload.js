const { sequelize, DataTypes } = require("./config/database");
const { Op } = require("sequelize");

// Getting all Models to create tables in our database
require("./src/models/index")(sequelize, DataTypes);

// Syncing Database
sequelize.sync({ alter: true }).then(() => {
  console.log("Industrial Pressing database well synced");
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
} = require("./src/models/reglementFacture/reglementFacture.model");

const { jsPDF } = require("jspdf"); // will automatically load the node version
require("jspdf-autotable");
const { resolve } = require("path");

const Fs = require("fs");

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
  const montantTotal = Number(
    await Facture.sum("montantTotalFacture", condition_date)
  ).toLocaleString();
  document.getElementById("total").innerHTML = (montantTotal ??= 0) + " FCFA";
  //function to find "Avance" of the curent month
  const montantAvance = Number(
    await Facture.sum("montantAvanceFacture", condition_date)
  ).toLocaleString();
  document.getElementById("avance").innerHTML = (montantAvance ??= 0) + " FCFA";
  //function to find "Reste" of the curent month
  const reste =
    (await Facture.sum("montantTotalFacture", condition_date)) -
    (await Facture.sum("montantAvanceFacture", condition_date));
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
      js_.id = "firstService";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstService")) {
        const element = document.getElementById("firstService");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondService";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondService")) {
        const item = document.getElementById("secondService");
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
      include: [Client, Service],
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
    };
  } else {
    condition_date = {
      include: [Client, Service],
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
    };
  }

  // remove all for `table_body`

  Facture.findAll(condition_date)
    .then((data) => {
      console.log("______<<<<<<<_____<<<<" + data);

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
            Number(item.dataValues.montantAvanceFacture).toLocaleString() +
            "</p></td>";
          // Sixth Column
          table_body +=
            '<td><p name="-"  >' +
            Number(
              item.dataValues.montantTotalFacture -
                item.dataValues.montantAvanceFacture
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

      // Loading js files
      var js_ = document.createElement("script");
      js_.type = "text/javascript";
      js_.src = "vendors/datatable/js/jquery.dataTables.min.js";
      js_.id = "firstClient";
      // //   document.body.removeChild(js_);
      // if (document.getElementById("firstService")) {
      //   const element = document.getElementById("firstService");
      //   element.replaceWith(js_);
      // } else {
      //   document.body.appendChild(js_);
      // }
      // var js = document.createElement("script");
      // js.type = "text/javascript";
      // js.src = "js/custom.js";
      // js.id = "secondService";
      // //   document.body.removeChild(js_);
      // if (document.getElementById("secondService")) {
      //   const item = document.getElementById("secondService");
      //   item.replaceWith(js);
      // } else {
      //   document.body.appendChild(js);
      // }

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
    })
    .catch((err) => {
      console.log(err);
    });

  //function to find occurence of Facture
  Facture.findAndCountAll(condition_date)
    .then((data) => {
      //console.log("rerererere" + data)
      document.getElementById("depots").innerHTML = Number(
        data.count
      ).toLocaleString();
    })
    .catch((err) => {
      console.log(err);
    });
  //function to find "Total" of the curent month
  const montantTotal = Number(
    await Facture.sum("montantTotalFacture", condition_date)
  ).toLocaleString();
  document.getElementById("total").innerHTML = (montantTotal ??= 0) + " FCFA";
  //function to find "Avance" of the curent month
  const montantAvance = Number(
    await Facture.sum("montantAvanceFacture", condition_date)
  ).toLocaleString();
  document.getElementById("avance").innerHTML = (montantAvance ??= 0) + " FCFA";
  //function to find "Reste" of the curent month
  const reste =
    (await Facture.sum("montantTotalFacture", condition_date)) -
    (await Facture.sum("montantAvanceFacture", condition_date));
  document.getElementById("reste").innerHTML =
    Number(reste).toLocaleString() + " FCFA";
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
      include: [Client, Service],
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
    };
  } else {
    condition_date = {
      include: [Client, Service],
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
    };
  }

  // remove all for `table_body`
  //function to find "Total" of the curent month
  montantTotal = await Facture.sum("montantTotalFacture", condition_date);
  montantTotal = (montantTotal ??= 0) + " FCFA ";
  //function to find "Avance" of the curent month
  montantAvance = await Facture.sum("montantAvanceFacture", condition_date);
  montantAvance = (montantAvance ??= 0) + " FCFA ";
  //function to find "Reste" of the curent month
  reste =
    (await Facture.sum("montantTotalFacture", condition_date)) -
    (await Facture.sum("montantAvanceFacture", condition_date));
  reste = reste + " FCFA ";

  Facture.findAll(condition_date).then((data) => {
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
  });
}

const generatePDFFile = (data, d, f, titre, cli, t, a, r) => {
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

  for (depot of data) {
    body.push([
      // counter++,
      depot.Client.nomClient,
      depot.Client.phoneClient,
      depot.montantTotalFacture,
      depot.montantAvanceFacture,
      depot.montantTotalFacture - depot.montantAvanceFacture,
      depot.dateDepotFacture.toLocaleDateString("en-US"),
      depot.dateRetraitFacture.toLocaleDateString("en-US"),
    ]);
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
        // "N°",
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
      js_.id = "firstClient";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstClient")) {
        const element = document.getElementById("firstClient");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondClient";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondClient")) {
        const item = document.getElementById("secondClient");
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
            "_" +
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
          clothe_type +=
            "<option value=" +
            item.dataValues.idLinge +
            ">" +
            item.dataValues.typeLinge +
            "</option>";
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
      document.getElementById("clothe_type" + rowIndex).innerHTML = clothe_type;
      document.getElementById("clothe_name" + rowIndex).innerHTML = clothe_name;
      // document.getElementById("clothe_description" + rowIndex).innerHTML =
      //   clothe_description;
      document.getElementById("clothe_priceUnitary" + rowIndex).innerHTML =
        clothe_priceUnitary;

      // Loading js files
      if (document.getElementById("firstClient")) {
        const element = document.getElementById("firstClient");
        element.replaceWith(document.createElement("script"));
      }
      if (document.getElementById("firstLinge")) {
        const element = document.getElementById("firstLinge");
        element.replaceWith(document.createElement("script"));
      }
      if (document.getElementById("firstOperateur")) {
        const element = document.getElementById("firstOperateur");
        element.replaceWith(document.createElement("script"));
      }
      if (document.getElementById("firstService")) {
        const element = document.getElementById("firstService");
        element.replaceWith(document.createElement("script"));
      }
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
            "_" +
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
    .then((result) => {
      document.getElementById("message").innerHTML =
        '<strong style="color: green;">Facture cree avec success!</strong>';
      console.log(result);
      if (data.reglementData) {
        ReglementFacture.create({
          montantReglementFacture: data.reglementData,
          idFacture: result.dataValues.idFacture,
        })

          .then(() => {})
          .catch((errno) => {
            console.log("Error Reglement: " + errno);
            console.log(errno);
          });
      }
      // Add each article in the created `Facture` instance
      data.lingeData.map((element) => {
        console.log(element);
        FactureLinge.create({
          idFacture: result.dataValues.idFacture,
          idLinge: element,
        })
          .then(() => {})
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
      js_.id = "firstLinge";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstLinge")) {
        const element = document.getElementById("firstLinge");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondLinge";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondLinge")) {
        const item = document.getElementById("secondLinge");
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
      js_.id = "firstOperateur";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstOperateur")) {
        const element = document.getElementById("firstOperateur");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondOperateur";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondOperateur")) {
        const item = document.getElementById("secondOperateur");
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
async function findAllFacture() {
  Facture.findAll({
    include: [Client, Service],
  })
    .then(async (data) => {
      let retrait_table_body = "";
      ReglementFacture.findAll().then((ele) => {
        console.log(ele);
      });

      // Fill boxes on the top of retraits screen
      // ::::::::::::::::: Total Depots
      document.getElementById("depots_total").innerHTML = data.length;
      // ::::::::::::::::: Total Clients
      const total_Client = Number(
        await Facture.count("idClient")
      ).toLocaleString();
      document.getElementById("totalClient").innerHTML = total_Client;
      // ::::::::::::::::: Total Depots Amount
      const totalAmount = Number(
        await Facture.sum("montantTotalFacture")
      ).toLocaleString();
      document.getElementById("totalDepotsAmount").innerHTML =
        totalAmount + " FCFA";
      // ::::::::::::::::: Total Avance Amount (Reglement Facture)
      const totalReglementFactureAmount = Number(
        await ReglementFacture.sum("montantReglementFacture")
      ).toLocaleString();
      document.getElementById("totalReglementFactureAmount").innerHTML =
        totalReglementFactureAmount + " FCFA";
      // ::::::::::::::::: Total Remaining Amount
      document.getElementById("totalRemainingAmount").innerHTML =
        (
          parseFloat(totalAmount) - parseFloat(totalReglementFactureAmount)
        ).toLocaleString() + " FCFA";

      // Filling the table with the list of Factures
      data
        .reverse()
        .map((item) => {
          retrait_table_body += "<tr>";
          retrait_table_body += '<th scope="row">';
          retrait_table_body +=
            '<a href="#" class="question_content">' +
            item.dataValues.idFacture +
            "</a>";
          retrait_table_body += "</th>";
          retrait_table_body +=
            "<td>" + item.dataValues.Client.nomClient + "</td>";
          retrait_table_body +=
            "<td>" +
            item.dataValues.montantTotalFacture.toLocaleString() +
            "</td>";
          retrait_table_body +=
            "<td>" + parseFloat(0).toLocaleString() + "</td>";
          retrait_table_body +=
            "<td>" +
            (
              parseFloat(item.dataValues.montantTotalFacture) - 0
            ).toLocaleString() +
            "</td>";
          retrait_table_body +=
            "<td>" +
            item.dataValues.dateDepotFacture.getDate() +
            "/" +
            (item.dataValues.dateDepotFacture.getMonth() + 1) +
            "/" +
            item.dataValues.dateDepotFacture.getFullYear() +
            "</td>";
          retrait_table_body +=
            "<td>" +
            item.dataValues.dateRetraitFacture.getDate() +
            "/" +
            (item.dataValues.dateRetraitFacture.getMonth() + 1) +
            "/" +
            item.dataValues.dateRetraitFacture.getFullYear() +
            "</td>";
          retrait_table_body +=
            '<td><a href="#" onclick="" class="btn btn-info btn-md text_white" role="button">Retrait\nAvance</a>';

          retrait_table_body += "</td></tr>";
        })
        .join();

      // Assigning `table_body` to the table id within the retrait screen
      document.getElementById("retrait_table_body").innerHTML =
        retrait_table_body;

      // Loading js files
      var js_ = document.createElement("script");
      js_.type = "text/javascript";
      js_.src = "vendors/datatable/js/jquery.dataTables.min.js";
      js_.id = "firstRetrait";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstRetrait")) {
        const element = document.getElementById("firstRetrait");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondRetrait";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondRetrait")) {
        const item = document.getElementById("secondRetrait");
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
      js_.id = "firstService";
      //   document.body.removeChild(js_);
      if (document.getElementById("firstService")) {
        const element = document.getElementById("firstService");
        element.replaceWith(js_);
      } else {
        document.body.appendChild(js_);
      }
      var js = document.createElement("script");
      js.type = "text/javascript";
      js.src = "js/custom.js";
      js.id = "secondService";
      //   document.body.removeChild(js_);
      if (document.getElementById("secondService")) {
        const item = document.getElementById("secondService");
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
  // function for dashboard statistics elements
  findStatistics: findStatistics,
  Printing_chart: Printing_chart,
  // function for  creances_client
  findAllCreances: findAllCreances,
  findAllClient_Creances: findAllClient_Creances,
  generate_Creances_PDFFile,
  generate_Creances_PDFFile,
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
  // Functions to Manage Operateur
  findAllOperateur: findAllOperateur,
  findOneOperateur: findOneOperateur,
  createOperateur: createOperateur,
  updateOperateur: updateOperateur,
  deleteOperateur: deleteOperateur,
  // Function to Manage Retraits
  findAllFacture: findAllFacture,
  // Functions to Manage Service
  findAllService: findAllService,
  findOneService: findOneService,
  createService: createService,
  updateService: updateService,
  deleteService: deleteService,
});
