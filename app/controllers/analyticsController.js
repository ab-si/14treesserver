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

module.exports.getLocBoundary = async(req, res) => {
  const query = 'Select * from plot';
  const boundaryQuery = 'Select index, lat, lng from plot_boundary where plot_id=$1'
  try {
    const {rows} = await dbQuery.query(query);
    for (let plot in rows) {
      let result = await dbQuery.query(boundaryQuery, [rows[plot].plot_id])
      rows[plot].plot_boundary = result.rows;
    }
    res.status(status.success).send(rows)
  } catch( error) {
    errorMessage.error = 'An error Occured';
    res.status(error).send(errorMessage);
  }
}