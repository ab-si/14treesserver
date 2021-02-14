const dbQuery  = require('../db/dev/dbQuery');

const {
    errorMessage, successMessage, status,
} = require('../helpers/status');

module.exports.getInfo = async (req, res) => {
    const getUserInfo = 'SELECT * FROM person where uuid=$1;';
    const id = 'c2d29867-3d0b-d497-9191-18a9d8ee7832';
    try {
      const { rows } = await dbQuery.query(getUserInfo, [id]);
      const dbResponse = rows;
      if (dbResponse[0] === undefined) {
        errorMessage.error = 'There are no such users';
        res.status(status.notfound).send(errorMessage);
      }
      successMessage.data = dbResponse[0];
      successMessage.image = 'https://14treesplants.s3.ap-south-1.amazonaws.com/plants/ranodeb-min.jpg';
      res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'An error Occured';
      res.status(error).send(errorMessage);
    }
  };

module.exports.getUserTreeReg = async(req,res) => {
  const query = 'SELECT * from user_tree_reg';
  try {
    const {rows} = await dbQuery.query(query);
    console.log(rows)
  } catch( error) {
    errorMessage.error = 'An error Occured';
    res.status(error).send(errorMessage);
  }
}