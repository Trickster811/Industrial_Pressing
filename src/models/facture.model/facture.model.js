const { sequelize, DataTypes } = require("../../../config/database");

const { Client } = require("../client.model/client.model");
const { FactureLinge } = require("../factureLinge.model/factureLinge.model");
const { Linge } = require("../linge.model/linge.model");
const {ReglementFacture,} = require("../reglementFacture/reglementFacture.model");
const { Service } = require("../service.model/service.model");


// module.exports = (sequelize, DataTypes) => {
const Facture = sequelize.define(
  "Facture",
  {
    // Model attributes are defined here
    idFacture: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    dateDepotFacture: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dateRetraitFacture: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    etatFacture: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    montantTotalFacture: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    montantAvanceFacture: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Facture",
    name: {
      singular: "Facture",
      plural: "Factures",
    },
  }
);


// Association with Client Model
Facture.belongsTo(Client, {
  foreignKey: "idClient",
});

// Association with Linge Model
Facture.belongsToMany(Linge, {
  through: FactureLinge,
});

// Association with Reglement Model
Facture.hasMany(ReglementFacture, {
  foreignKey: "idReglementFacture",
});

// Association with Service Model
Facture.belongsTo(Service, {
  foreignKey: "idService",
});

//   return Facture;
// };

module.exports = { Facture };
