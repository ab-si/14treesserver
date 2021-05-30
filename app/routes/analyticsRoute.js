const routes = require('express').Router();

const info = require('../controllers/analyticsController');

routes.get('/totaltree', info.getTotalTree);

module.exports = routes;