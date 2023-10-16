
// Connection to MySQL database via the package SEQUELIZE
const { Sequelize, DataTypes, QueryTypes } = require("sequelize");

const { Client } = require("./src/models/client.model/client.model");
const { Facture } = require("./src/models/facture.model/facture.model");

// Find all users
async function select_user() {
    // Create a new user
    //const jane = await Client.create({ nomClient: "Jane", phoneClient: 677345578 });
    //console.log("Jane's auto-generated ID:", jane.idClient);

    const users = await Client.findAll();
    //console.log(users.every(user => user instanceof User)); // true
    console.log("All users:", JSON.stringify(users, null, 2));

}

select_user()
<<<<<<< HEAD
=======
const { contextBridge } = require("electron");
const { Service } = require("./src/models/service.model/service.model");
const { Client } = require("./src/models/client.model/client.model");
const { Operateur } = require("./src/models/operateur.model/operateur.model");
const { Linge } = require("./src/models/linge.model/linge.model");
>>>>>>> master

/ ////////////////////////////////////////////////////////////////////////////// //
// //////////////////////// Controller For Dashboard //////////////////////////// //
// ////////////////////////////////////////////////////////////////////////////// //

// Function to find statistics "clients","depots","total","avance" and "reste"
async function findStatistics() {
  Facture.findAndCountAll()
    .then((data) => {
      document.getElementById("depots").innerHTML = data
      document.getElementById("clients").innerHTML = "1"
      document.getElementById("total").innerHTML = "1"
      document.getElementById("avance").innerHTML = "1"
      document.getElementById("reste").innerHTML = "1"
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
<<<<<<< HEAD
=======

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
  // Functions to Manage Client
  findAllClient: findAllClient,
  findOneClient: findOneClient,
  createClient: createClient,
  updateClient: updateClient,
  deleteClient: deleteClient,
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
  // Functions to Manage Service
  findAllService: findAllService,
  findOneService: findOneService,
  createService: createService,
  updateService: updateService,
  deleteService: deleteService,
});
>>>>>>> master
