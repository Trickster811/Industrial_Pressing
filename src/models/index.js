module.exports = () => {
  // get models to create or update
  require("./user.model/user.model");
  // get associations between models to create or update
  require("./user.model/association.user");
 
};
