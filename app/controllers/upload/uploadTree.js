const dbQuery  = require('../../db/dev/dbQuery');
const {v4:uuid} = require('uuid');
var moment = require('moment');
var time = moment();

const insertTree = `with tree_insert as (INSERT into tree(id, sapling_id, name, date_added)
 select $1, $2, $3, $4::timestamp where not exists (select * from tree where sapling_id=$5) returning tree.id)
 select id from tree_insert union select id from tree where sapling_id=$6
`
const getTreeId = `select id from tree where sapling_id=$1`

module.exports.UploadTree = async (row) => {
    
    let newUUID = uuid();
    try {
        let { rows } = await dbQuery.query(insertTree, [newUUID, row[1], row[2], row[0], row[1], row[1]]);
        return rows[0]['id']
    } catch (error) {
        return error
    }
    
  }

module.exports.GetTreeID = async (sapling_id) => {
    try {
        let { rows } = await dbQuery.query(getTreeId, [sapling_id])
        return rows[0]['id']
    } catch (error) {
        return error
    }
}