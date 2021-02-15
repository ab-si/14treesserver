const dbQuery  = require('../db/dev/dbQuery');
var multer = require('multer')
const util = require('util');
// const creds = require('../client_credentials.json');
const tree = require('./upload/uploadTree');
const person = require('./upload/uploadPerson');
const loc = require('./upload/uploadLoc');
const rec = require('./upload/uploadRec')
const event = require('./upload/uploadEvent')
const { google } = require('googleapis')
const { Sheets } = require("../helpers/auth");

const {
  errorMessage, successMessage, status,
} = require('../helpers/status');

const fs = require("fs");
const fastcsv = require("fast-csv");
var moment = require('moment');
var time = moment();
const {v4:uuid} = require('uuid');

const Pool = require("pg").Pool;
const { resolve } = require('path');
require('dotenv').config();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 0,
});

function getData(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: '1R6CyD_pPLcsah9rlPwJ4dqcLtzkptxJJCrm-dQBu6qM',
    range: '4feb!A1:Z3', //Change Sheet1 if your worksheet's name is something else
  }, (err, response) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    } 
    var rows = response.values;
    if (rows.length === 0) {
      console.log('No data found.');
    } else {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        console.log(row.join(", "));
      }
    }
  });
}

var dest = '/Users/abhisheks/work/14treesserver/app/data/';

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dest)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname )
  }
})
var upload = multer({ storage: storage }).single('file')

const writeFile = (file, data) => {
  var csvStream = fastcsv.write(data, {
      headers: true,
      includeEndRowDelimiter: true,
  });
  csvStream
  .on('finish', function(err){
      console.log("File Written ! ")
  })
  .pipe(fs.createWriteStream(file, {flags:'a'}));
}

const readFile = (dest, file) => {
  return new Promise((resolve, reject) => {
    let headers = [];
    let isHeaderSet = false
    let csvData = [];
    let csvStream = fastcsv.parseFile(dest+file ,{headers: false})
      .on('data', function (row) {
        csvStream.pause();
        if (!isHeaderSet) {
          headers.push(row);
          headers[0].push('person_id')
          headers[0].push('tree_id')
          headers[0].push('loc_id')
          headers[0].push('event_id')
          headers[0].push('user_tree_rec_id')
          isHeaderSet = true
          // dataToWrite.push(headers[0])
        } else {
          csvData.push(row)
        }
        csvStream.resume();
        })
      .on('end', function() {
        console.log("Data read complete from CSV!")
        resolve([csvData, headers]);
      })
      .on('error', function(err) {
        reject(err)
      })
  })
}

const uploadCsvRecord = async(dest, file) => {
  let data = await readFile(dest, file)
  let csvData = data[0]
  let dataToWrite = data[1]
  let uuid;
  for (const row of csvData) {
    uuid = await person.UploadPerson(row)
    row.push(uuid)
    uuid = await tree.UploadTree(row)
    row.push(uuid)
    uuid = await loc.UploadLoc(row)
    row.push(uuid)
    uuid = await event.UploadEvent(row)
    row.push(uuid)
    uuid = await rec.UploadRec(row)
    row.push(uuid)
    dataToWrite.push(row)
  }
  return dataToWrite
}

const addDataFromCsv = async(res) => {
  const data = await uploadCsvRecord(dest, res.req.file.filename);
  fs.unlinkSync(dest+res.req.file.filename);
  writeFile(dest+res.req.file.filename, data)
}

module.exports.uploadCsv = async(req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err)
    } else if (err) {
        return res.status(400).json(err)
    } else {
      try {
        addDataFromCsv(res)
      } catch (error) {
        res.status(500);
      }
    }
  })
  res.status(status.success).send(successMessage);
}

module.exports.updateCsv = async(req, res) => {

  const spreadsheetId = '1R6CyD_pPLcsah9rlPwJ4dqcLtzkptxJJCrm-dQBu6qM'
  const sheetName = '4feb'
  let data;

  Sheets.spreadsheets.values.batchGet({
    spreadsheetId: spreadsheetId,
    // A1 notation of the values to retrieve  
    ranges: [sheetName + '!A1:Z3'],
    majorDimension: 'ROWS'
    })
    .then((resp) => {
        data = resp.data.valueRanges;
        data.forEach((range) => {
            console.log(range);
        });
    })
    .catch((err) => {
        console.log(err);
    });

  Sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [
          [new Date().toISOString(), "Some value", "Another value"]
        ],
      },
    }, (err, response) => {
      if (err) return console.error(err)
    });
  res.status(200).json('Working')

  // authentication.authenticated()
  //   .then((auth) => {
  //     res.status(200)
  //     .json('Working')
  //   })
  //   .catch(err => {
  //     res.status(401)
  //     .json(`you know wetin happen, ${err}`)
  //   })
}