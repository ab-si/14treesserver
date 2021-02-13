const dbQuery  = require('../../db/dev/dbQuery');
const {v4:uuid} = require('uuid');
var moment = require('moment');
var time = moment();

const insertRec = `INSERT into user_tree_reg(id, tree_id, person_id, loc_id, date) values ($1, $2, $3, (select plot_id from plot where name = $4), $5);`

module.exports.UploadRec = async (row) => {
    
    let newUUID = uuid();
    var timeInserted = time.format('YYYY-MM-DD HH:mm:ss Z');
    try {
        await dbQuery.query(insertRec, [newUUID, row[20], row[21], row[6], timeInserted]);
        return newUUID
    } catch (error) {
        return error
    }
    
  }