const { Facture } = require("../facture.model/facture.model");
const { Linge } = require("../linge.model/linge.model");
const { FactureLinge } = require("./factureLinge.model");

// Association with Facture
FactureLinge.belongsTo(Facture, { foreignKey: 'idFacture' });

// Association with Linge
FactureLinge.belongsTo(Linge, { foreignKey: 'idLinge' });