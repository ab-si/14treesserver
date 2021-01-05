const dbQuery  = require('../db/dev/dbQuery');

const {
    errorMessage, successMessage, status,
} = require('../helpers/status');

module.exports.getTree = async (req, res) => {
    const getUserInfo = 'SELECT * FROM profile_view where id=$1;';
    try {
      const { rows } = await dbQuery.query(getUserInfo, [req.query.id]);
      const dbResponse = rows;
      if (dbResponse[0] === undefined) {
        errorMessage.error = 'There are no such users';
        res.status(status.notfound).send(errorMessage);
      }
      successMessage.data = dbResponse[0];
      successMessage.treeImage = 'https://14treesplants.s3.ap-south-1.amazonaws.com/plants/ranodeb-min.jpg';
      successMessage.userImage = 'https://14treesplants.s3.ap-south-1.amazonaws.com/plants/' + dbResponse[0].profile_image + '.jpeg';
      res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'An error Occured';
      res.status(error).send(errorMessage);
    }
  };