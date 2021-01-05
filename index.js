'use strict';

const express = require('express');

const cors = require('cors');

const infoRoute = require('./app/routes/infoRoute');
const searchRoute = require('./app/routes/searchRoute');
const uploadRoute = require('./app/routes/uploadRoute');

const app = express();
const port = process.env.PORT || "7000";

// Add middleware for parsing URL encoded bodies (which are usually sent by browser)
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

app.use('/api/v1', infoRoute);
app.use('/api/v1/search', searchRoute);
app.use('/api/v1/upload', uploadRoute);

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});