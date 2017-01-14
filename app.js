var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('src/public'));
app.locals.moment = require('moment');
app.set('views', './src/views')
app.set('view engine', 'pug');

const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

MongoClient.connect('mongodb://localhost:27017/activity_tracking', (err, database) => {
    if (err) return console.log(err)

    app.use('/data/activities', require('./src/activity/data-routes')(database));    
    app.use('/activities', require('./src/activity/page-routes')(database));

    app.listen(3000, function () {
        console.log('App listening on port 3000!')
    });
});