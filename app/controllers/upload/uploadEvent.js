const dbQuery  = require('../../db/dev/dbQuery');
const {v4:uuid} = require('uuid');

var insertEventQuery = `with event_insert as (INSERT into event(id, name)
 select $1, $2 where not exists (select * from event where name=$3) returning event.id)
 select id from event_insert union select id from event where name=$4`

module.exports.UploadEvent = async (row) => {
    
    let newUUID = uuid();
    try {
        let res = await dbQuery.query(insertEventQuery, [newUUID, row[15], row[15], row[15]])
        return res.rows[0]['id'];
    } catch (err) {
        return err
    }
  }