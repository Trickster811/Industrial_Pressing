const { sequelize, DataTypes } = require("../../../config/database");
const { Facture } = require("../facture.model/facture.model");

// module.exports = (sequelize, DataTypes) => {
const ReglementFacture = sequelize.define(
  "ReglementFacture",
  {
    // Model attributes are defined here
    idReglementFacture: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    montantReglementFacture: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // idFacture: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: Facture,
    //     key: "idFacture",
    //   },
    // },
  },
  {
    tableName: "ReglementFacture",
    name: {
      singular: "ReglementFacture",
      plural: "ReglementFactures",
    },
  }
);

//   return ReglementFacture;
// };

module.exports = { ReglementFacture };
