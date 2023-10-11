// Import modules
const { Sequelize, DataTypes } = require("sequelize");

// Enable connection with database
const sequelize = new Sequelize( {
  dialect: "sqlite",
  storage: './industrial_pressing.base.sqlite'
});

// Sync database
sequelize
  .authenticate()
  .then(() => {
    console.log(
      "Connection to the database has been established successfully."
    );
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Export connection token
module.exports = { sequelize, DataTypes };
