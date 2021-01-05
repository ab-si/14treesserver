const routes = require('express').Router();

const upload = require('../controllers/uploadController');

routes.get('/user', upload.uploadUserCsv);
routes.get('/tree', upload.uploadTreeCsv)
routes.get('/plot', upload.uploadLocCsv)
routes.get('/record', upload.insertRecord)

module.exports = routes;