const { sequelize, DataTypes } = require("../../../config/database");

// module.exports = (sequelize, DataTypes) => {
const Client = sequelize.define(
  "Client",
  {
    // Model attributes are defined here
    idClient: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    nomClient: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    phoneClient: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Client",
    name: {
      singular: "Client",
      plural: "Clients",
    },
  }
);

//   return Client;
// };

module.exports = { Client };
