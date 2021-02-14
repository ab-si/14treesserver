const routes = require('express').Router();

const info = require('../controllers/infoController');

routes.get('/info', info.getInfo);
routes.get('/all', info.getUserTreeReg)

module.exports = routes;