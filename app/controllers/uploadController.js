const dbQuery  = require('../db/dev/dbQuery');

const fs = require("fs");
const fastcsv = require("fast-csv");
var moment = require('moment');
var time = moment();
const {v4:uuid} = require('uuid');

module.exports.uploadUserCsv = async (req, res) => {

    const insertUser = 'INSERT into person(id, name, date_added) values($1, $2, $3);';
    let stream = fs.createReadStream('/Users/abhisheks/work/14treesserver/app/data/4jan.csv');
    let csvData = [];
    let csvStream = fastcsv
    .parse()
    .on("data", function(data) {
        csvData.push(data[3]);
    })
    .on("end", function() {
        // remove the first line: header
        csvData.shift();
        
        var time_format = time.format('YYYY-MM-DD HH:mm:ss Z');

        csvData.forEach(row => {
            dbQuery.query(insertUser, [uuid(), row, time_format], (err, res) => {
              if (err) {
                console.log(err.stack);
              } else {
                console.log("inserted " + res.rowCount + " row:", row);
              }
            });
          });
        // console.log(csvData)
        // const { rows } = dbQuery.query(insertUser, [csvData, time_format]);
        // console.log(rows)
    });

    stream.pipe(csvStream);
}

module.exports.uploadTreeCsv = async (req, res) => {
//     INSERT INTO tree
//          (sapling_id, name)
//          SELECT 'tree-1', 'mango'
//          WHERE
//          NOT EXISTS (
//         SELECT name FROM tree WHERE name = 'mango'
//     );
    const insertTree = 'INSERT into tree(id, sapling_id, name, date_added) values($1, $2, $3, $4);';
    let stream = fs.createReadStream('/Users/abhisheks/work/14treesserver/app/data/4jan.csv');
    let csvData = [];
    let csvStream = fastcsv
    .parse()
    .on("data", function(data) {
        csvData.push(data);
    })
    .on("end", function() {
        // remove the first line: header
        csvData.shift();
        
        var time_format = time.format('YYYY-MM-DD HH:mm:ss Z');
        csvData.forEach(row => {
            dbQuery.query(insertTree, [uuid(), row[1], row[2], time_format], (err, res) => {
              if (err) {
                console.log(err.stack);
              } else {
                console.log("inserted " + res.rowCount + " row:", row);
              }
            });
          });
        // console.log(csvData)
        // const { rows } = dbQuery.query(insertUser, [csvData, time_format]);
        // console.log(rows)
    });

    stream.pipe(csvStream);
}

module.exports.uploadLocCsv = async(req, res) => {
    const insertTree = 'INSERT into plot(plot_id, name) select $1, $2 where not exists (select name from plot where name = $3);';
    let stream = fs.createReadStream('/Users/abhisheks/work/14treesserver/app/data/4jan.csv');
    let csvData = [];
    let csvStream = fastcsv
    .parse()
    .on("data", function(data) {
        csvData.push(data);
    })
    .on("end", function() {
        // remove the first line: header
        csvData.shift();
        
        csvData.forEach(row => {
            dbQuery.query(insertTree, [uuid(), row[6], row[6]], (err, res) => {
              if (err) {
                console.log(err.stack);
              } else {
                console.log("inserted " + res.rowCount + " row:", row);
              }
            });
          });
        // console.log(csvData)
        // const { rows } = dbQuery.query(insertUser, [csvData, time_format]);
        // console.log(rows)
    });

    stream.pipe(csvStream);
}

module.exports.insertRecord = async(req, res) => {
    const insertTreeRec = 'INSERT into user_tree_reg(id, tree_id, person_id, loc_id, date) values ($1, $2, $3, (select plot_id from plot where name = $4), $5);';
    let stream = fs.createReadStream('/Users/abhisheks/work/14treesserver/app/data/4jan_consolidated.csv');
    let csvData = [];
    let csvStream = fastcsv
    .parse()
    .on("data", function(data) {
        csvData.push(data);
    })
    .on("end", function() {
        // remove the first line: header
        csvData.shift();
        var time_format = time.format('YYYY-MM-DD HH:mm:ss Z');
        
        csvData.forEach(row => {
            console.log("" + row[20] + " --- " + row[21] + " --- " + row[6])
            dbQuery.query(insertTreeRec, [uuid(), row[20], row[21], row[6], time_format], (err, res) => {
              if (err) {
                console.log(err.stack);
              } else {
                console.log("inserted " + res.rowCount + " row:", row);
              }
            });
          });
        // console.log(csvData)
        // const { rows } = dbQuery.query(insertUser, [csvData, time_format]);
        // console.log(rows)
    });

    stream.pipe(csvStream);
}