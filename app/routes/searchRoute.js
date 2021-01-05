const routes = require('express').Router();

const search  = require('../controllers/searchController');

routes.get('/user', search.searchUser);
routes.get('/tree', search.searchTree);
routes.get('/event', search.searchEvent);
routes.get('/loc', search.searchLoc);
routes.get('/getcount', search.getCountForQuery);

module.exports = routes;