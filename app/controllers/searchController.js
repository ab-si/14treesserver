const dbQuery  = require('../db/dev/dbQuery');
const { GetPersonById, GetTreeById, GetLocById, GetEventById } = require('./search/searchById');

const {
    errorMessage, successMessage, status,
} = require('../helpers/status');
const { GetLocID } = require('./upload/uploadLoc');

module.exports.searchTree = async (req, res) => {
    const getTree = 'SELECT * FROM tree where name ilike $1 offset $2 limit $3;';
    const key = '%' + req.query.term + '%';
    const size = req.query.size;
    const index = req.query.index - 1;
    const offset = index * size;
    try {
      const { rows } = await dbQuery.query(getTree, [key, offset, size]);
      const dbResponse = rows;
      successMessage.data = dbResponse;
      res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'An error Occured';
      res.status(error).send(errorMessage);
    }
  };

  module.exports.searchUser = async (req, res) => {
    const getUser = 'SELECT * FROM person where name ilike $1 offset $2 limit $3;';
    const key = '%' + req.query.term + '%';
    const size = req.query.size;
    const index = req.query.index - 1;
    const offset = index * size;
    try {
      const { rows } = await dbQuery.query(getUser, [key, offset, size]);
      const dbResponse = rows;
      for (let i = 0; i< dbResponse.length; i++){
            dbResponse[i].profile_image = 'https://14treesplants.s3.ap-south-1.amazonaws.com/users/' + dbResponse[i].profile_image + '.jpeg';
        }
      successMessage.data = dbResponse;
      res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'An error Occured';
      res.status(error).send(errorMessage);
    }
  };

  module.exports.searchEvent = async (req, res) => {
    const getEvent = 'SELECT * FROM event where name ilike $1 offset $2 limit $3;';
    const key = '%' + req.query.term + '%';
    const size = req.query.size;
    const index = req.query.index - 1;
    const offset = index * size;
    try {
      const { rows } = await dbQuery.query(getEvent, [key, offset, size]);
      const dbResponse = rows;
      successMessage.data = dbResponse;
      res.status(status.success).send(successMessage);
    } catch (error) {
      errorMessage.error = 'An error Occured';
      res.status(error).send(errorMessage);
    }
  };

module.exports.searchLoc = async (req, res) => {
  const getLoc = 'SELECT * FROM plot where name ilike $1 offset $2 limit $3;';
  const key = '%' + req.query.term + '%';
  const size = req.query.size;
  const index = req.query.index - 1;
  const offset = index * size;
  try {
    const { rows } = await dbQuery.query(getLoc, [key, offset, size]);
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
    ' (SELECT COUNT(*) FROM  person where name ilike $1) AS user_count,' +
    ' (SELECT COUNT(*) FROM  plot where name ilike $1) AS loc_count;'

  const key = '%' + req.query.term + '%';

  try {
    const { rows } = await dbQuery.query(getCount, [key]);
    const dbResponse = rows;
    successMessage.data = dbResponse;
    res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'An error Occured';
    res.status(error).send(errorMessage);
  }
};

module.exports.getSearchList = async (req, res) => {
  const size = req.query.size;
  const index = req.query.index - 1;
  const offset = index * size;
  let getRes = '';
  if (req.query.type == 'user'){
    getRes = 'SELECT * FROM profile_view where person_name ilike $1 offset $2 limit $3;'
  } else if (req.query.type == 'tree') {
    getRes = 'SELECT * FROM profile_view where tree_name ilike $1 offset $2 limit $3;'
  } else if (req.query.type == 'event') {
    getRes = 'SELECT * FROM profile_view where event_name ilike $1 offset $2 limit $3;'
  } else if (req.query.type == 'loc') {
    getRes = 'SELECT * FROM profile_view where loc_name ilike $1 offset $2 limit $3;'
  }
  const key = '%' + req.query.term + '%';

  try {
    const { rows } = await dbQuery.query(getRes, [key, offset, size]);
    const dbResponse = rows;
    successMessage.data = dbResponse;
    res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'An error Occured';
    res.status(error).send(errorMessage);
  }
};

module.exports.getSaplingData = async(req, res) => {
  let getSapling = `select * from user_tree_reg where tree_id=(select id from tree where sapling_id=$1)`;
  try {
    const { rows } = await dbQuery.query(getSapling, [req.query.id]);
    if (rows.length > 0) {
      let response = {};
      const userSaplingInfo = rows[0];
      const userid = userSaplingInfo.person_id;
      const treeid = userSaplingInfo.tree_id;
      const locid = userSaplingInfo.loc_id;
      const eventid = userSaplingInfo.event_id;

      response.id = userSaplingInfo.id;
      response.date = userSaplingInfo.date;
      response.person = await GetPersonById(userid)
      response.tree = await GetTreeById(treeid)
      response.loc = await GetLocById(locid)
      response.event = await GetEventById(eventid)

      let person_image = [];
      if (userSaplingInfo.user_image.length > 0) {
        for (let image in userSaplingInfo.user_image) {
          let url = "https://14treesplants.s3.ap-south-1.amazonaws.com/users/" + userSaplingInfo.user_image[image]
          person_image.push(url)
        }
      }
      response.user_image = person_image;

      let gallery = [];
      if (userSaplingInfo.extra_image.length > 0) {
        for (let image in userSaplingInfo.extra_image) {
          let url = "https://14treesplants.s3.ap-south-1.amazonaws.com/gallery/" + userSaplingInfo.extra_image[image]
          gallery.push(url)
        }
      }
      response.gallery = gallery;
      res.status(status.success).send(response);
    } else {
      res.status(status.nocontent).send();
    }
  } catch (error) {
    errorMessage.error = 'An error Occured';
    res.status(error).send(errorMessage);
  }
}
