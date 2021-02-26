const routes = require('express').Router();

const info = require('../controllers/getInfoController');

routes.get('/locations', info.getLocations);

module.exports = routes;