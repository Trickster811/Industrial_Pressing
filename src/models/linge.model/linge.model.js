const { sequelize, DataTypes } = require("../../../config/database");

// module.exports = (sequelize, DataTypes) => {
const Linge = sequelize.define(
  "Linge",
  {
    // Model attributes are defined here
    idLinge: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    codeLinge: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    typeLinge: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    designationLinge: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    montantLinge: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Linge",
    name: {
      singular: "Linge",
      plural: "Linges",
    },
  }
);

//   return Linge;
// };

module.exports = { Linge };
