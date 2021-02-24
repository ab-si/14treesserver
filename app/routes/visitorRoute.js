const routes = require('express').Router();
const multer = require('multer');
const upload = multer();

var destImg = '/Users/abhisheks/work/14treesserver/app/data/images/'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, destImg);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
var uploadImages = multer({ storage: storage})

const controller = require('../controllers/uploadController');

routes.post('/form', uploadImages.array('userImages', 12), controller.uploadVisitor)

module.exports = routes;