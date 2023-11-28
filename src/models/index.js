module.exports = () => {
  // get models to create or update
  require("./client.model/client.model");
  require("./linge.model/linge.model");
  require("./operateur.model/operateur.model");
  require("./service.model/service.model");
  require("./facture.model/facture.model");
  require("./reglementFacture/reglementFacture.model");
  require("./factureLinge.model/factureLinge.model");
  // get associations between models to create or update
  require("./client.model/association.client");
  require("./linge.model/association.linge");
  require("./operateur.model/association.operateur");
  require("./service.model/association.service");
  require("./facture.model/association.facture");
  require("./reglementFacture/association.reglementFacture");
  require("./factureLinge.model/association.factureLinge");
};
