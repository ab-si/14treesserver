const client  = require('./client');

module.exports.query =  (queryText, params) => {
  return client.query(queryText, params);
};
