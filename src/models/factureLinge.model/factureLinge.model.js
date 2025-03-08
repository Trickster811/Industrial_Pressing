const { sequelize, DataTypes } = require("../../../config/database");
const { Facture } = require("../facture.model/facture.model");
const { Linge } = require("../linge.model/linge.model");

// module.exports = (sequelize, DataTypes) => {
const FactureLinge = sequelize.define(
  "FactureLinge",
  {
    // Model attributes are defined here
    idFactureLinge: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    // idFacture: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: Facture,
    //     key: "idFacture",
    //   },
    // },
    descriptionLinge: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantityLinge: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue:1,
    },
  },
  {
    tableName: "FactureLinge",
    name: {
      singular: "FactureLinge",
      plural: "FactureLinges",
    },
  }
);

//   return FactureLinge;
// };

module.exports = { FactureLinge };
