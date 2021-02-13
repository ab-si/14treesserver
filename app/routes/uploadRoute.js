const routes = require('express').Router();

const upload = require('../controllers/uploadController');

routes.post('/csv', upload.uploadCsv)
// routes.get('/test', upload.test)

module.exports = routes;