const { sequelize, DataTypes } = require("../../../config/database");

// module.exports = (sequelize, DataTypes) => {
const Operateur = sequelize.define(
  "Operateur",
  {
    // Model attributes are defined here
    idOperateur: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    nameOperateur: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Operateur",
    name: {
      singular: "Operateur",
      plural: "Operateurs",
    },
  }
);

//   return Operateur;
// };

module.exports = { Operateur };
