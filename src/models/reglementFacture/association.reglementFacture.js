const { Facture } = require("../facture.model/facture.model");
const { ReglementFacture } = require("./reglementFacture.model");

// Association with Facture Model
ReglementFacture.belongsTo(Facture, {
  foreignKey: { name: "idFacture", allowNull: false },
});
