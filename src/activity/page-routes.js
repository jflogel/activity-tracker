const mongo = require('mongodb');
const moment = require('moment');
var router = require('express').Router();
var activity = require('./model')
var mapper = require('./mapper')
var activityValidator = require('./activity-validator')
var repository;

router.route('/add')
    .get(function (req, res) {
        res.render('activity-edit', {activities: activity.allActivities, model: {}});
    })
    .post(function (req, res) {
        const errors = activityValidator.validate(req.body);
        
        if (errors.length > 0) {
            res.render('activity-edit', {activities: activity.allActivities, model: req.body, errors: errors});
            return;
        }

        repository.saveActivity(mapper.mapToModel(req.body)).then(function() {
            res.redirect('/activities/list');
        });
    });

router.route('/edit/:id')
    .get(function (req, res) {
        repository.findActivity(req.params.id).then(function(activityFound) {
            res.render('activity-edit', {activities: activity.allActivities, model: mapper.mapToDTO(activityFound)});
        });
    })
    .post(function (req, res) {
        const errors = activityValidator.validate(req.body);
        
        if (errors.length > 0) {
            res.render('activity-edit', {activities: activity.allActivities, model: req.body, errors: errors});
            return;
        }

        var model = mapper.mapToModel(req.body);
        model._id = new mongo.ObjectID(req.params.id);
        repository.saveActivity(model).then(function() {
            res.redirect('/activities/list');
        });
    });

router.get('/delete/:id', function(req, res) {
    repository.deleteActivity(req.params.id).then(function() {
        res.redirect('/activities/list');
    });
});

function getWeeklyStats(requestedActivity) {
    const thisWeeksActivities = repository.findActivities(moment().startOf('week').unix(), requestedActivity.description);
    return thisWeeksActivities.then(activities => {
        const goalType = requestedActivity.goalType;
        if (goalType === 'distance') {
            const totalDistance = activities.reduce((accum, curr) => {
                return accum + curr.distance.value;
            }, 0);
            return `${totalDistance} ${activities[0].distance.unit}`;
        } else if (goalType === 'duration') {
            const totalDuration = activities.reduce((accum, curr) => {
                return accum + curr.time_duration.value;
            }, 0);
            return `${totalDuration} ${activities[0].time_duration.unit}`;
        } else {
            return `${activities.length} sessions`;
        }
    });
}

function getYearlyStats(activities, requestedActivity) {
    const weeksThisYear = moment().dayOfYear() / 7;
    const goalType = requestedActivity.goalType;
    if (goalType === 'distance') {
        const totalDistance = activities.reduce((accum, curr) => {
            return accum + curr.distance.value;
        }, 0);
        const unit = activities[0].distance.unit;
        return {
            average: `${totalDistance / weeksThisYear} ${unit}`,
            total: `${totalDistance} ${unit}`
        };
    } else if (goalType === 'duration') {
        const totalDuration = activities.reduce((accum, curr) => {
            return accum + curr.time_duration.value;
        }, 0);
        const durationUnit = activities[0].time_duration.unit;
        return {
            average: `${totalDuration / weeksThisYear} ${durationUnit}`,
            total: `${totalDuration} ${durationUnit}`
        };
    }
    const count = activities.length;
    return {
        average: `${count / weeksThisYear} sessions`,
        total: `${count} sessions`
    };
}

router.get(['/', '/list'], function (req, res) {
    const requestedActivity = activity.getByDescription(req.query.activity);
    repository.findMostRecentActivity()
        .then((activity) => {
            const activities = repository.findActivities(moment.unix(activity.datetime).startOf('year').unix(), requestedActivity.description),
                weeklyStats = getWeeklyStats(requestedActivity);
            
            Promise.all([activities, weeklyStats]).then(values => {
                    var activityStats;
                    if (requestedActivity.description !== 'Unknown') {
                        const yearlyStats = getYearlyStats(values[0], requestedActivity);
                        activityStats = {
                            totalForWeek: values[1],
                            average: yearlyStats.average,
                            totalForYear: yearlyStats.total
                        }
                    }
                    res.render('activity-list', { 
                        activities: values[0].map(mapper.mapToDTO), 
                        path: requestedActivity.description,
                        activityStats
                    });
                });
        });
});

module.exports = function(dataSource) {
    repository = require('./repository')(dataSource);
    return router;
}