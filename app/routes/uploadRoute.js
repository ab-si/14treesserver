const routes = require('express').Router();

const upload = require('../controllers/uploadController');

routes.post('/csv', upload.uploadCsv)
routes.post('/googlecsv', upload.googleCsv)
routes.post('/treecsv', upload.uploadTree)

module.exports = routes;
