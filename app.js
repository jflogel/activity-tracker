var express = require('express');
var bodyParser = require('body-parser');

var activity = require('./src/activity/model')
var mapper = require('./src/activity/mapper')
var activityValidator = require('./src/activity/activity-validator')

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('src/public'));
app.locals.moment = require('moment');
app.set('views', './src/views')
app.set('view engine', 'pug');

const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
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

app.get('/data/dashboard', function (req, res) {
    db.collection('goal').find()
        .toArray()
        .then(function(goals) {
            res.send(goals);
        });
});

app.route('/data/activities')
    .get(function (req, res) {
        findActivities()
            .then(function(activities) {
                res.send(activities.map(mapper.mapToDTO));
            });
    });

app.get('/data/activities/:activity', function (req, res) {
    const description = req.params.activity;
    findActivities(description)
        .then(function(activities) {
            res.send(activities.map(mapper.mapToDTO));
        });
});

app.route('/activities/add')
    .get(function (req, res) {
        res.render('activity-edit', {activities: activity.allActivities, model: {}});
    })
    .post(function (req, res) {
        const errors = activityValidator.validate(req.body);
        
        if (errors.length > 0) {
            res.render('activity-edit', {activities: activity.allActivities, model: req.body, errors: errors});
            return;
        }

        saveActivity(mapper.mapToModel(req.body)).then(function() {
            res.redirect('/activities/list');
        });
    });

app.route('/activities/edit/:id')
    .get(function (req, res) {
        findActivity(req.params.id).then(function(activityFound) {
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
        saveActivity(model).then(function() {
            res.redirect('/activities/list');
        });
    });

app.get('/activities/delete/:id', function(req, res) {
    deleteActivity(req.params.id).then(function() {
        res.redirect('/activities/list');
    });
});

app.get(['/', '/activities/list'], function (req, res) {
  findActivities()
        .then(function(activities) {
            res.render('activity-list', { activities: activities.map(mapper.mapToDTO) });
        });
});

app.get('/activities/list/:activity', function (req, res) {
    const description = req.params.activity;
    findActivities(description)
        .then(function(activities) {
            res.render('activity-list', { activities: activities.map(mapper.mapToDTO), path: description });
        });
});

MongoClient.connect('mongodb://localhost:27017/activity_tracking', (err, database) => {
    if (err) return console.log(err)
    db = database
    app.listen(3000, function () {
        console.log('App listening on port 3000!')
    });
});