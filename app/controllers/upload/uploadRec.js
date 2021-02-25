const dbQuery  = require('../../db/dev/dbQuery');
const {v4:uuid} = require('uuid');
var moment = require('moment');
var time = moment();

const insertRec = `INSERT into user_tree_reg(id, person_id, tree_id, loc_id, event_id, date) values ($1, $2, $3, $4, $5, $6);`
const insertTreeLocRec = `with rec_insert as (INSERT into user_tree_reg(id, tree_id, loc_id, event_id, date)
 select $1, $2, $3, '4a1116a1-de6d-413d-98c2-eff1a28569df', $4::timestamp where not exists (select * from user_tree_reg where tree_id=$5) returning user_tree_reg.id)
 select id from rec_insert union select id from user_tree_reg where tree_id=$6
`

const updateRecForTree = `update user_tree_reg set person_id=$1, user_image=$2::VARCHAR[], extra_image=$3::VARCHAR[] where tree_id=$4`
module.exports.UploadRec = async (row) => {
    
    let newUUID = uuid();
    var timeInserted = time.format('YYYY-MM-DD HH:mm:ss Z');
    try {
        await dbQuery.query(insertRec, [newUUID, row[20], row[21], row[22], row[23], timeInserted]);
        return newUUID
    } catch (error) {
        return error
    }
    
  }

module.exports.UploadTreeLocRec = async (row) => {

    let newUUID = uuid();
    var timeInserted = time.format('YYYY-MM-DD HH:mm:ss Z');
    try {
        let {rows} = await dbQuery.query(insertTreeLocRec, [newUUID, row[4], row[5], timeInserted, row[4], row[4]]);
        return rows[0]['id']
    } catch (error) {
        return error
    }
}

module.exports.UpdateRec = async (data) => {
    console.log(data)
    try {
        let {rows} = await dbQuery.query(updateRecForTree, [data[0],data[1],data[2],data[3]]);
        console.log(rows)
    } catch (error) {
        console.log(error)
        return error
    }
}