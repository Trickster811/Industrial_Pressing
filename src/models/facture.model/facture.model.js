const { sequelize, DataTypes } = require("../../../config/database");

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
  },
  {
    tableName: "Facture",
    name: {
      singular: "Facture",
      plural: "Factures",
    },
  }
);

//   return Facture;
// };

module.exports = { Facture };
