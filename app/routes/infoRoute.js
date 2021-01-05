const routes = require('express').Router();

const info = require('../controllers/infoController');
const { route } = require('./searchRoute');

routes.get('/info', info.getInfo);
routes.get('/all', info.getUserTreeReg)

module.exports = routes;