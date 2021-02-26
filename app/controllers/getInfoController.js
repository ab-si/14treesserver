const dbQuery  = require('../db/dev/dbQuery');

const {
    errorMessage, successMessage, status,
} = require('../helpers/status');

module.exports.getLocations = async(req,res) => {
    const query = 'SELECT * from plot';
    try {
      const {rows} = await dbQuery.query(query);
      console.log(rows)
      res.status(status.success).send(rows)
    } catch( error) {
      errorMessage.error = 'An error Occured';
      res.status(error).send(errorMessage);
    }
}