const dbQuery  = require('../../db/dev/dbQuery');
const {v4:uuid} = require('uuid');
var moment = require('moment');
var time = moment();

const insertPerson = `INSERT into person(id, name, phone, org, email, date_added) values($1, $2, $3, $4, $5, $6);`

module.exports.UploadPerson = async (row) => {
    let newUUID = uuid();
    var timeInserted = time.format('YYYY-MM-DD HH:mm:ss Z');
    try {
        await dbQuery.query(insertPerson, [newUUID, row[3], row[4], row[5], row[6], timeInserted])
        return newUUID;
    } catch (err) {
        return err
    }
  }