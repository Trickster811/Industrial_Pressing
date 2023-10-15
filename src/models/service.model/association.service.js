const { Facture } = require("../facture.model/facture.model");
const { Service } = require("./service.model");

// Association with Facture Model
Service.hasMany(Facture, {
  foreignKey: "idFacture",
});
