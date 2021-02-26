'use strict';

const express = require('express');

const cors = require('cors');
const verifyToken = require('./app/auth/verifyToken');

const infoRoute = require('./app/routes/infoRoute');
const searchRoute = require('./app/routes/searchRoute');
const uploadRoute = require('./app/routes/uploadRoute');
const loginRoute = require('./app/routes/loginRoute');
const visitorRoute = require('./app/routes/visitorRoute');

const app = express();
const port = process.env.PORT || "7000";

app.use(cors());
// Add middleware for parsing JSON and urlencoded data and populating `req.body`
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Pass to next layer of middleware
    next();
});

app.use('/api/v1/login', loginRoute);
app.use('/api/v1/search', searchRoute);
app.use('/api/v1/visitor', visitorRoute);
app.use('/api/v1', verifyToken, infoRoute);
app.use('/api/v1/upload', verifyToken, uploadRoute);

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});