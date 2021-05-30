const dbQuery  = require('../db/dev/dbQuery');

const {
    errorMessage, successMessage, status,
} = require('../helpers/status');

module.exports.getTotalTree = async(req,res) => {
    const query = 'SELECT count(*) from user_tree_reg';
    try {
      const {rows} = await dbQuery.query(query);
      res.status(status.success).send(rows)
    } catch( error) {
      errorMessage.error = 'An error Occured';
      res.status(error).send(errorMessage);
    }
}