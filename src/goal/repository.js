var db;

function findGoals() {
    return db.collection('goal').find({}).toArray();
}

module.exports = function(dataSource) {
    db = dataSource;
    return {
        findGoals: findGoals
    };
}