// Import modules
const { Sequelize, DataTypes } = require("sequelize");

// Enable connection with database
const sequelize = new Sequelize( {
  dialect: "sqlite",
  storage: './industrial_pressing.base.sqlite'
});

// const sequelize = new Sequelize("industrial_pressing_base", "postgres", "leslie02", {
//   host: "localhost",
//   dialect: "postgres", 
// });

// const sequelize = new Sequelize("industrial_pressing_base", "root", "", {
//     host: "localhost",
//     dialect: "mysql", 
//   });

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
