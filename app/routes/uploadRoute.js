const routes = require('express').Router();

const upload = require('../controllers/uploadController');

routes.post('/csv', upload.uploadCsv)
routes.post('/googlecsv', upload.googleCsv)

module.exports = routes;
