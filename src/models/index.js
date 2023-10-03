module.exports = () => {
  // get models to create or update
  require("./client.model/client.model");
  require("./facture.model/facture.model");
  require("./factureLinge.model/factureLinge.model");
  require("./linge.model/linge.model");
  require("./operateur.model/operateur.model");
  require("./reglementFacture/reglementFacture.model");
  require("./service.model/service.model");
  // get associations between models to create or update
  require("./client.model/association.client");
  require("./facture.model/association.facture");
  require("./factureLinge.model/association.factureLinge");
  require("./linge.model/association.linge");
  require("./operateur.model/association.operateur");
  require("./reglementFacture/association.reglementFacture");
  require("./service.model/association.service");
};
