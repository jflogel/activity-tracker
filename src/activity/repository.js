const mongo = require('mongodb'),
    moment = require('moment');
const activity = require('./model');
var db;

function findActivities(year, activityDescription) {
    const dateForYear = moment().year(year),
        startOfYear = dateForYear.startOf('year').unix(),
        endOfYear = dateForYear.endOf('year').unix();
    const filter = {datetime: {$gte: startOfYear, $lte: endOfYear}};
    if (activityDescription) {
        filter.activity_id = activity.getByDescription(activityDescription).id;
    }

    return db.collection('activity_tracking')
        .find(filter, {sort:{datetime:-1}})
        .toArray();
}

function findActivity(id) {
    return db.collection('activity_tracking')
        .findOne({_id:new mongo.ObjectId(id)});
}

function saveActivity(activity) {
    return db.collection('activity_tracking')
        .save(activity);
}

function deleteActivity(id) {
    return db.collection('activity_tracking')
        .remove({_id: new mongo.ObjectID(id)});
}

function findMostRecentActivity() {
    return db.collection('activity_tracking')
        .findOne({}, {sort: {datetime: -1}});
}

module.exports = function(dataSource) {
    db = dataSource;
    return {
        findActivity,
        findActivities,
        findMostRecentActivity,
        saveActivity,
        deleteActivity
    };
}