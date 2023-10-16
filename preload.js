
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
