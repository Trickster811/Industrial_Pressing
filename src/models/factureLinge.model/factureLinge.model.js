const { sequelize, DataTypes } = require("../../../config/database");

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
