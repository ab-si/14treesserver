const dbQuery  = require('../db/dev/dbQuery');
const { GetTreeById } = require('./search/searchById');

const {
    errorMessage, successMessage, status,
} = require('../helpers/status');

module.exports.getProfile = async(req,res) => {
    let user_url = "https://14treesplants.s3.ap-south-1.amazonaws.com/users/";
    let plants_url = "https://14treesplants.s3.ap-south-1.amazonaws.com/plants/";
    let getTreeQuery = 'SELECT id from tree where sapling_id=$1';
    let getUserQuery = 'SELECT * from person where id=(select person_id from user_tree_reg where tree_id=$1)';
    let getTreesQuery = 'select * from user_tree_reg where person_id=(select person_id from user_tree_reg where person_id=$1)';
    try {
        let result = await dbQuery.query(getTreeQuery, [req.query.id]);
        if (result.rows.length === 0) {
            errorMessage.error = 'There are no trees found with this sapling id';
        }
        let person = await dbQuery.query(getUserQuery, [result.rows[0].id]);
        if (person.rows.length === 0) {
            errorMessage.error = 'There are no users associated with the sapling id';
            res.status(status.notfound).send(errorMessage);
        }
        let trees = await dbQuery.query(getTreesQuery, [person.rows[0].id]);
        if(trees.rows.length === 0) {
            errorMessage.error = 'No tree found for user';
            res.status(status.notfound).send(errorMessage);
        }

        successMessage.name = person.rows[0].name;
        successMessage.organisation = person.rows[0].org;
        if(person.rows[0].profile_image !== null) {
            successMessage.profile_image = user_url + person.rows[0].profile_image;
        }
        
        let treeRes = [];
        for (let tree in trees.rows) {
            let treeObj = await GetTreeById(trees.rows[tree].tree_id)
            let treeImages = [];
            if(trees.rows[tree].memories.length > 0) {
                for (let memory in trees.rows[tree].memories) {
                    let treeImage = user_url + trees.rows[tree].memories[memory];
                    treeImages.push(treeImage)
                }
            }
            treeObj.location = JSON.stringify(trees.rows[tree].location);
            treeObj.memories = treeImages;
            treeObj.image = plants_url + treeObj.image;
            treeRes.push(treeObj);
        }
        successMessage.treesPlanted = treeRes;
        res.status(status.success).send(successMessage);
    } catch( error) {
        errorMessage.error = 'An error Occured';
        res.status(error).send(errorMessage);
    }
}
