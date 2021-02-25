const dbQuery  = require('../db/dev/dbQuery');
var multer = require('multer')
const tree = require('./upload/uploadTree');
const person = require('./upload/uploadPerson');
const loc = require('./upload/uploadLoc');
const rec = require('./upload/uploadRec')
const event = require('./upload/uploadEvent')
const { Sheets } = require("../helpers/auth");

const fs = require("fs");
const fastcsv = require("fast-csv");

const { resolve } = require('path');
const { CheckTreeEntry, CheckUserTreeEntry } = require('./upload/helper');
require('dotenv').config();
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID_S3,
  secretAccessKey: process.env.SECRET_ACCESS_KEY_S3
});

const {
  errorMessage, successMessage, status,
} = require('../helpers/status');

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

const uploadFileToS3 = async (src, filename, type) => {
  const readStream = fs.createReadStream(src+filename);
  let bucket;

  if (type === "user") {
    bucket = process.env.BUCKET_USERS
  } else if (type === "extra") {
    bucket = process.env.BUCKET_GALLERY
  }
  const params = {
    Bucket: bucket,
    Key: filename,
    Body: readStream
  };

  try {
    await s3.upload(params).promise();
  } catch (error) {
    return error
  }
}

const insertUserTreeReg = async(fields) => {
  let uImages;
  let exImages;
  uImages = fields.userImages.split(',');
  exImages = fields.extraImages.split(',');
  let uImagesForDB = "";
  let exImagesForDB = "";
  // let uImages=`'{`;
  if (fields.userImages.length > 0) {
    uImagesForDB = `{`;
    uImages = fields.userImages.split(',');
    // await uploadFileToS3(dest+'/images/', uImages, "user")
  }

  if (fields.extraImages.length > 0) {
    exImagesForDB = `{`;
    exImages = fields.extraImages.split(',');
    // await uploadFileToS3(dest+'/images/', exImages, "extra")
  }
  try {
    for (const image in uImages) {
      uImagesForDB += '"' + uImages[image] + '"';
      if (image < uImages.length-1) {
        uImagesForDB += ','
      }
      await uploadFileToS3(dest+'/images/', uImages[image], 'user')      
    }
    uImagesForDB += `}`;
    for (const image in exImages) {
      exImagesForDB += '"' + exImages[image] + '"';
      if (image < exImages.length-1) {
        exImagesForDB += ','
      }
      await uploadFileToS3(dest+'/images/', exImages[image], 'extra')      
    }
    exImagesForDB += `}`;
  } catch (error) {
    console.log("errors")
  }

  let personData = Array(3).fill(" ");
  personData.push(fields.name);
  personData.push(fields.contact);
  personData.push(fields.org);
  personData.push(fields.email)

  try {
    let personUUID = await person.UploadPerson(personData);
    let treeUUID = await tree.GetTreeID(fields.sapling);

    let recData = [];
    recData.push(personUUID);
    recData.push(uImagesForDB);
    recData.push(exImagesForDB);
    recData.push(treeUUID);
    await rec.UpdateRec(recData);
  } catch (error) {
    console.log(error)
  }

  return true
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

module.exports.uploadVisitor = async(req, res) => {
  const files = req.files
  const fields = req.body
  try {
    let treeExists = await CheckTreeEntry(fields.sapling)
    if (!treeExists) {
      res.statusMessage = "Invalid sapling ID provided!";
      res.status(status.nocontent).end();
    }

    let userTreeExists = await CheckUserTreeEntry(fields.sapling)
    if (!userTreeExists) {
      res.statusMessage = "Record doesn't exists for the given sapling ID!";
      res.status(status.duplicate).end();
    }
    
    let insert = await insertUserTreeReg(fields);

    if (insert) {
      res.statusMessage = "Data uploaded successfully!"
      res.status(status.success).end();
    }
    res.statusMessage = "Server error occured! Please contact admin!";
    res.status(status.error).end();
  } catch (error) {
    console.log(error)
  }
}