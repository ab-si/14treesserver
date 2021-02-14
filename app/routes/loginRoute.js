const routes = require('express').Router();
const {
    status,
} = require('../helpers/status');

routes.post('/user', (req, res) => {
    let username = req.body.params.password;
    let password = req.body.params.password;
    if (username === 'admin' && password ==='admin') {
        res.status(status.success).send({
            token: 'thisneedstobeupdated'
        })
    } else {
        res.status(status.unauthorized).send('Invalid credentials!');
    }
  });

module.exports = routes;