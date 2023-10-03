const { sequelize, DataTypes } = require("../../../config/database");

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
