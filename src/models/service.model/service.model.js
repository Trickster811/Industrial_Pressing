const { sequelize, DataTypes } = require("../../../config/database");

// module.exports = (sequelize, DataTypes) => {
const Service = sequelize.define(
  "Service",
  {
    // Model attributes are defined here
    idService: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    nomService: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descriptionService: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dureeService: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tauxService: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Service",
    name: {
      singular: "Service",
      plural: "Services",
    },
  }
);

//   return Service;
// };

module.exports = { Service };
