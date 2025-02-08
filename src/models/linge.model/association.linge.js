const { Facture } = require("../facture.model/facture.model");
const { FactureLinge } = require("../factureLinge.model/factureLinge.model");
const { Linge } = require("./linge.model");

// Association with Facture
Linge.belongsToMany(Facture, {
  through: {
    model: FactureLinge,
    unique: false,
  },
  foreignKey: "idLinge",
});
