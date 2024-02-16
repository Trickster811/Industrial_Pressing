module.exports = () => {
  // get models to create or update
  require("./client.model/client.model");
  require("./linge.model/linge.model");
  require("./operateur.model/operateur.model");
  require("./service.model/service.model");
  require("./facture.model/facture.model");
  require("./reglementFacture.model/reglementFacture.model");
  require("./factureLinge.model/factureLinge.model");
  require("./parametrage.model/parametrage.model")
  // get associations between models to create or update
  require("./client.model/association.client");
  require("./linge.model/association.linge");
  require("./operateur.model/association.operateur");
  require("./service.model/association.service");
  require("./facture.model/association.facture");
  require("./reglementFacture.model/association.reglementFacture");
  require("./factureLinge.model/association.factureLinge");
};
