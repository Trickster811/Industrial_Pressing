const { sequelize, DataTypes } = require("../../../config/database");

// module.exports = (sequelize, DataTypes) => {
const User = sequelize.define(
  "User",
  {
    // Model attributes are defined here
    idUser: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    nameUser: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "User",
    name: {
      singular: "User",
      plural: "Users",
    },
  }
);

//   return User;
// };

module.exports = { User };
