const { Client } = require("../client.model/client.model");
const { FactureLinge } = require("../factureLinge.model/factureLinge.model");
const { Linge } = require("../linge.model/linge.model");
const {
  ReglementFacture,
} = require("../reglementFacture.model/reglementFacture.model");
const { Service } = require("../service.model/service.model");
const { Facture } = require("./facture.model");

// Association with Client Model
Facture.belongsTo(Client, {
  foreignKey: "idClient",
});

// Association with Linge Model
Facture.belongsToMany(Linge, {
  through: {
    model: FactureLinge,
    unique: false,
  },
  foreignKey: "idFacture",
});

// Association with Reglement Model
Facture.hasMany(ReglementFacture, {
  // foreignKey: "idReglementFacture",
  foreignKey: "idFacture",
});

// Association with Service Model
Facture.belongsTo(Service, {
  foreignKey: "idService",
});
