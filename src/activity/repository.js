const mongo = require('mongodb');
const activity = require('./model');
var db;

function findActivities(activityDescription) {
    const activityFilter = activityDescription 
        ? {activity_id: activity.getByDescription(activityDescription).id}
        : {};
    return db.collection('activity_tracking')
        .find(activityFilter, {sort:{datetime:-1}})
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

module.exports = function(dataSource) {
    db = dataSource;
    return {
        findActivity: findActivity,
        findActivities: findActivities,
        saveActivity: saveActivity,
        deleteActivity: deleteActivity
    };
}