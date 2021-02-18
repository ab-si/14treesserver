const dbQuery  = require('../../db/dev/dbQuery');
const {v4:uuid} = require('uuid');
var moment = require('moment');
var time = moment();

const insertTree = `with tree_insert as (INSERT into tree(id, sapling_id, name, date_added)
 select $1, $2, $3, $4 where not exists (select * from tree where sapling_id=$5) returning tree.id)
 select id from tree_insert union select id from tree where sapling_id=$6
`

module.exports.UploadTree = async (row) => {
    
    let newUUID = uuid();
    var timeInserted = time.format('YYYY-MM-DD HH:mm:ss Z');
    try {
        let { rows } = await dbQuery.query(insertTree, [newUUID, row[1], row[2], timeInserted, row[1], row[1]]);
        return rows[0]['id']
    } catch (error) {
        return error
    }
    
  }