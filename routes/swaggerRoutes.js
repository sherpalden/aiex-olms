const router =  require('express').Router();

//swagger docs routes
const yaml = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const swagOpt = {
  swaggerOptions: {
    validatorUrl: null,
  }
};
const userAPI = yaml.load('./api-docs/API.yaml');
router.use('/', swaggerUi.serve, swaggerUi.setup(userAPI, swagOpt));

module.exports = router;