var router = require('express').Router();
var activity = require('./model')
var mapper = require('./mapper');
var moment = require('moment');
var repository;
var db;

router.get('/dashboard', function (req, res) {
    db.collection('goal').find()
        .toArray()
        .then(function(goals) {
            res.send(goals);
        });
});

router.route('/').get(function (req, res) {
        const description = req.query.activity;
        repository.findMostRecentActivity()
            .then((activity) => {
                repository.findActivities(moment.unix(activity.datetime).startOf('year').unix(), description)
                    .then(function(activities) {
                        res.send(activities.map(mapper.mapToDTO));
                    });
            });
    });

function sumActivityForDay(activitiesForDay, activityId) {
    return activitiesForDay.reduce((accum, activ) => {
        if (activ.activity_id === activityId) {
            return accum + activ.time_duration.value;
        }
        return accum;
    }, 0);
}

router.get('/chart', function (req, res) {
    const description = req.query.activity;
    const activitiesSinceDate = moment().subtract(31, 'days');
    repository.findActivities(activitiesSinceDate.unix(), description)
        .then(function(latestActivities) {
            const legendValues = ['Activity'];
            activity.allActivities.forEach((activ) => legendValues.push(activ.description));

            const previous30Days = {};
            for (date = moment().startOf('day'); date.isSameOrAfter(activitiesSinceDate); date.subtract(1, 'days')) {
                previous30Days[date.unix()] = [];
            }
            const activitiesGroupedByDay = latestActivities.reduce((accum, currVal) => {
                const date = moment.unix(currVal.datetime).startOf('day').unix();
                if (!accum.hasOwnProperty(date)) {
                    accum[date] = [currVal];
                } else {
                    accum[date].push(currVal);
                }
                return accum;
            }, previous30Days);

            const daysGrouped = Object.keys(activitiesGroupedByDay);
            const activitiesForLast30Days = [];
            daysGrouped.forEach((day) => {
                var activitiesForDay = [];
                const activities = activitiesGroupedByDay[day];

                activitiesForDay[0] = moment.unix(day).format('M/D');
                activitiesForDay[1] = sumActivityForDay(activities, 1);
                activitiesForDay[2] = sumActivityForDay(activities, 2);
                activitiesForDay[3] = sumActivityForDay(activities, 3);
                activitiesForDay[4] = sumActivityForDay(activities, 4);

                activitiesForLast30Days.push(activitiesForDay);
            });

            var output = [legendValues];
            activitiesForLast30Days.forEach((item) => output.push(item));
            res.send(output);
        });
});

module.exports = function(dataSource) {
    db = dataSource;
    repository = require('./repository')(dataSource);
    return router;
}