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

router.route('/')
    .get(function (req, res) {
        repository.findMostRecentActivity()
            .then((activity) => {
                repository.findActivities(moment.unix(activity.datetime).year())
                    .then(function(activities) {
                        res.send(activities.map(mapper.mapToDTO));
                    });
            });
    });

router.get('/:activity', function (req, res) {
    const description = req.params.activity;
    repository.findMostRecentActivity()
            .then((activity) => {
                repository.findActivities(moment.unix(activity.datetime).year(), description)
                    .then(function(activities) {
                        res.send(activities.map(mapper.mapToDTO));
                    });
            });
});

module.exports = function(dataSource) {
    db = dataSource;
    repository = require('./repository')(dataSource);
    return router;
}