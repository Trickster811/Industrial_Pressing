const { Facture } = require("../facture.model/facture.model");
const { Client } = require("./client.model");

Client.hasMany(Facture, {
  foreignKey: "idFacture",
});
