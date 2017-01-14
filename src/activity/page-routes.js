const mongo = require('mongodb');
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

router.get(['/', '/list'], function (req, res) {
    repository.findActivities()
        .then(function(activities) {
            res.render('activity-list', { activities: activities.map(mapper.mapToDTO) });
        });
});

router.get('/list/:activity', function (req, res) {
    const description = req.params.activity;
    repository.findActivities(description)
        .then(function(activities) {
            res.render('activity-list', { activities: activities.map(mapper.mapToDTO), path: description });
        });
});

module.exports = function(dataSource) {
    repository = require('./repository')(dataSource);
    return router;
}