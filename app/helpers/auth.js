'use strict'

const { google } = require('googleapis')

const creds = require('./sheet-node-test.json')
const scopes = 'https://www.googleapis.com/auth/spreadsheets'

const authClient = new google.auth.JWT(
    creds.client_email,
    null,
    creds.private_key,
    [scopes]);

module.exports.Sheets = google.sheets({ version: 'v4', auth: authClient });
