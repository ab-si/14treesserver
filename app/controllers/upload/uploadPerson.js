const dbQuery  = require('../../db/dev/dbQuery');
const {v4:uuid} = require('uuid');
var moment = require('moment');
var time = moment();

const insertPerson = `INSERT into person(id, name, date_added) values($1, $2, $3);`

module.exports.UploadPerson = async (row) => {
    
    let newUUID = uuid();
    var timeInserted = time.format('YYYY-MM-DD HH:mm:ss Z');
    try {
        await dbQuery.query(insertPerson, [newUUID, row[3], timeInserted])
        return newUUID;
    } catch (err) {
        return err
    }
  }