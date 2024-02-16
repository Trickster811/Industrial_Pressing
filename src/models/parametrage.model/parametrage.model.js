const { sequelize, DataTypes } = require("../../../config/database");

// module.exports = (sequelize, DataTypes) => {
const ChiffreAffaire = sequelize.define(
  "ChiffreAffaire",
  {
    // Model attributes are defined here
    idChiffreAffaire: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    janvierChiffreAffaire: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    fevrierChiffreAffaire: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    marsChiffreAffaire: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    avrilChiffreAffaire: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    maiChiffreAffaire: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    juinChiffreAffaire: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    juilletChiffreAffaire: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    aoutChiffreAffaire: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    septembreChiffreAffaire: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    octobreChiffreAffaire: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    novembreChiffreAffaire: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    decembreChiffreAffaire: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  {
    tableName: "ChiffreAffaire",
    name: {
      singular: "ChiffreAffaire",
      plural: "ChiffreAffaires",
    },
  }
);

//   return ChiffreAffaire;
// };

module.exports = { ChiffreAffaire };
