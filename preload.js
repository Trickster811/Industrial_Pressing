
// Connection to MySQL database via the package SEQUELIZE
const { Sequelize, DataTypes, QueryTypes } = require("sequelize");

const { Client } = require("./src/models/client.model/client.model");

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