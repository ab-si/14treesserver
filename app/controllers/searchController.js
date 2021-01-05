const dbQuery  = require('../db/dev/dbQuery');

const {
    errorMessage, successMessage, status,
} = require('../helpers/status');

module.exports.searchTree = async (req, res) => {
    const getTree = 'SELECT * FROM tree where name ilike $1;';
    const key = '%' + req.query.term + '%';
    try {
      const { rows } = await dbQuery.query(getTree, [key]);
      const dbResponse = rows;
      // if (dbResponse[0] === undefined) {
      //   errorMessage.error = 'There are no such users';
      //   res.status(status.notfound).send(errorMessage);
      // }
      // for (let i = 0; i< dbResponse.length; i++){
      //     dbResponse[i].tree_image = 'https://14treesplants.s3.ap-south-1.amazonaws.com/plants/ranodeb-min.jpg';
      //     dbResponse[i].user_image = 'https://14treesplants.s3.ap-south-1.amazonaws.com/plants/' + dbResponse[i].profile_image + '.jpeg';
      // }
      successMessage.data = dbResponse;
      res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'An error Occured';
      res.status(error).send(errorMessage);
    }
  };

  module.exports.searchUser = async (req, res) => {
    const getUser = 'SELECT * FROM person where name ilike $1;';
    const key = '%' + req.query.term + '%';
    try {
      const { rows } = await dbQuery.query(getUser, [key]);
      const dbResponse = rows;
      successMessage.data = dbResponse;
      res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'An error Occured';
      res.status(error).send(errorMessage);
    }
  };

  module.exports.searchEvent = async (req, res) => {
    const getEvent = 'SELECT * FROM event where name ilike $1;';
    const key = '%' + req.query.term + '%';
    try {
      const { rows } = await dbQuery.query(getEvent, [key]);
      const dbResponse = rows;
      successMessage.data = dbResponse;
      res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'An error Occured';
      res.status(error).send(errorMessage);
    }
  };

  module.exports.searchLoc = async (req, res) => {
    const getLoc = 'SELECT * FROM plot where name ilike $1;';
    const key = '%' + req.query.term + '%';
    try {
      const { rows } = await dbQuery.query(getLoc, [key]);
      const dbResponse = rows;
      successMessage.data = dbResponse;
      res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'An error Occured';
      res.status(error).send(errorMessage);
    }
  };

module.exports.getCountForQuery = async (req, res) => {
  const getCount = 'SELECT (SELECT COUNT(*) FROM  tree where name ilike $1) as tree_count,' +
    ' (SELECT COUNT(*) FROM  event where name ilike $1) AS event_count,' +
    ' (SELECT COUNT(*) FROM  person where name ilike $1) AS person_count,' +
    ' (SELECT COUNT(*) FROM  plot where name ilike $1) AS loc_count;'

  const key = '%' + req.query.term + '%';

  try {
    const { rows } = await dbQuery.query(getCount, [key]);

    // successMessage.tree_count = rows[0].tree_count
    // successMessage.user_count = rows[0].person_count
    // successMessage.event_count = rows[0].event_count
    // successMessage.loc_count = rows[0].loc_count
    const dbResponse = rows;
    successMessage.data = dbResponse;
    // successMessage.total_count = rows[0].tree_count + rows[0].person_count + rows[0].event_count + rows[0].loc_count;
    res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'An error Occured';
    res.status(error).send(errorMessage);
  }
};