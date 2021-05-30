const routes = require('express').Router();

const info = require('../controllers/analyticsController');

routes.get('/totaltree', info.getTotalTree);
routes.get('/getSites', info.getLocBoundary)

module.exports = routes;