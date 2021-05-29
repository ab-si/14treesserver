const routes = require('express').Router();

const profile = require('../controllers/profileController');

routes.get('/', profile.getProfile);

module.exports = routes;