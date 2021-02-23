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

const readFileForTree = (dest, file) => {
  return new Promise((resolve, reject) => {
    let headers = [];
    let isHeaderSet = false
    let csvData = [];
    let csvStream = fastcsv.parseFile(dest+file ,{headers: false})
      .on('data', function (row) {
        csvStream.pause();
        if (!isHeaderSet) {
          headers.push(row);
          headers[0].push('tree_id')
          headers[0].push('loc_id')
          headers[0].push('rec_id')
          isHeaderSet = true
        } else {
          csvData.push(row)
        }
        csvStream.resume();
        })
      .on('end', function() {
        console.log("Data read complete from CSV for Tree data!")
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

const uploadTreeRecord = async(dest, file) => {
  let data = await readFileForTree(dest, file)
  let csvData = data[0]
  let dataToWrite = data[1]
  let uuid;
  for (const row of csvData) {
    uuid = await tree.UploadTree(row)
    row.push(uuid)
    uuid = await loc.UploadLocForTree(row)
    row.push(uuid)
    uuid = await rec.UploadTreeLocRec(row)
    row.push(uuid)
    dataToWrite.push(row)
  }
  return dataToWrite
}

const addDataFromCsv = async(file) => {
  const data = await uploadCsvRecord(dest, file);
  fs.unlinkSync(dest+file);
  writeFile(dest+file, data)
}

const addTreeFromcsv = async(file) => {
  const data = await uploadTreeRecord(dest, file);
  fs.unlinkSync(dest+file);
  writeFile(dest+file, data)
}

module.exports.uploadCsv = async(req, res) => {

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err)
    } else if (err) {
        return res.status(400).json(err)
    } else {
      try {
        addDataFromCsv(res.req.file.filename)
      } catch (error) {
        res.status(500);
      }
    }
  })
  res.status(status.success).send(successMessage);
}

module.exports.googleCsv = async(req, res) => {

  const spreadsheetId = '1R6CyD_pPLcsah9rlPwJ4dqcLtzkptxJJCrm-dQBu6qM';
  const sheetName = req.body.params.sheetname;

  let data;

  await Sheets.spreadsheets.values.batchGet({
    spreadsheetId: spreadsheetId,
    // A1 notation of the values to retrieve
    ranges: [sheetName],
    majorDimension: 'ROWS'
    })
    .then((resp) => {
        data = resp.data.valueRanges;
    })
    .catch((err) => {
        console.log(err);
    });

  writeFile(dest+sheetName+'.csv', data[0].values)
  try {
    addDataFromCsv(sheetName+'.csv')
  } catch (error) {
    res.status(500);
  }
  res.status(200).json('Working')
}

module.exports.uploadTree = async(req, res ) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err)
    } else if (err) {
        return res.status(400).json(err)
    } else {
      try {
        addTreeFromcsv(res.req.file.filename)
      } catch (error) {
        res.status(500);
      }
    }
  })
  res.status(status.success).send(successMessage);
}
