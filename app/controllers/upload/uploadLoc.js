const dbQuery  = require('../../db/dev/dbQuery');
const {v4:uuid} = require('uuid');

var insertLocQuery = `with loc_insert as (INSERT into plot(plot_id, name)
 select $1, $2 where not exists (select * from plot where name=$3) returning plot.plot_id)
 select plot_id from loc_insert union select plot_id from plot where name=$4`

module.exports.UploadLoc = async (row) => {
    
    let newUUID = uuid();
    try {
        let res = await dbQuery.query(insertLocQuery, [newUUID, row[6], row[6], row[6]])
        return res.rows[0]['plot_id'];
    } catch (err) {
        return err
    }
  }

module.exports.UploadLocForTree = async (row) => {

    let newUUID = uuid();
    try {
        console.log(row)
        let res = await dbQuery.query(insertLocQuery, [newUUID, row[3], row[3], row[3]])
        return res.rows[0]['plot_id'];
    } catch (err) {
        return err
    }
}