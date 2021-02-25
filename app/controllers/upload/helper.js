const dbQuery  = require('../../db/dev/dbQuery');
const fs = require("fs");
const fastcsv = require("fast-csv");
var multer = require('multer')

var dest = '/Users/abhisheks/work/14treesserver/app/data/';

module.exports.CheckTreeEntry = async (sapling_id) => {
    const query = `select * from tree where sapling_id=$1`
    try {
        let res = await dbQuery.query(query, [sapling_id]);
        if (res.rowCount === 0) {
            return false
        }
        return true
    } catch (err) {
        return err
    }
}

module.exports.CheckUserTreeEntry = async (sapling_id) => {
    const query = `select * from user_tree_reg where tree_id=(select id from tree where sapling_id=$1)`
    try {
        let res = await dbQuery.query(query, [sapling_id]);
        if (res.rowCount === 0) {
            return false
        }
        return true
    } catch (error) {
        return err
    }
}

module.exports.Write = (file, data) => {
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