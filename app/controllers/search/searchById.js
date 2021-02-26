const dbQuery  = require('../../db/dev/dbQuery');

module.exports.GetPersonById = async (id) => {
    const query = `select * from person where id=$1`
    try {
        let { rows } = await dbQuery.query(query, [id]);
        return rows[0];
    } catch (err) {
        return err
    }
}

module.exports.GetTreeById = async (id) => {
    const query = `select * from tree where id=$1`
    try {
        let { rows } = await dbQuery.query(query, [id]);
        return rows[0];
    } catch (err) {
        return err
    }
}

module.exports.GetLocById = async (id) => {
    const query = `select * from plot where plot_id=$1`
    try {
        let { rows } = await dbQuery.query(query, [id]);
        return rows[0];
    } catch (err) {
        return err
    }
}

module.exports.GetEventById = async (id) => {
    const query = `select * from event where id=$1`
    try {
        let { rows } = await dbQuery.query(query, [id]);
        return rows[0];
    } catch (err) {
        return err
    }
}