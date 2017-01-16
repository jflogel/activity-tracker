var db;

function findGoals(year) {
    return db.collection('goal').find({year: year}).toArray();
}

module.exports = function(dataSource) {
    db = dataSource;
    return {
        findGoals: findGoals
    };
}