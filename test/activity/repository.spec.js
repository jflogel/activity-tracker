const chai = require('chai');
const moment = require('moment');
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
chai.use(require("chai-as-promised"));

describe('activity repository', () => {
    var repository;
    const activity1 = createActivity(moment('2017-01-01').unix(), 1),
        activity2 = createActivity(moment('2017-01-04').unix(), 2),
        activity3 = createActivity(moment('2017-01-02').unix(), 3),
        activity4 = createActivity(moment('2017-01-03').unix(), 3),
        activity5 = createActivity(moment('2016-01-03').unix(), 3);

    before((done) => {
        MongoClient.connect('mongodb://localhost:27017/activity_tracking_test', (err, database) => {
            if (err) return console.log(err)
            repository = require('./../../src/activity/repository')(database);

            database.collection('activity_tracking').drop();
            database.collection('activity_tracking').insert([activity1, activity2, activity3, activity4, activity5]);
            done();
        });
    });
    
    describe('find most recent activity', () => {
        it('should retrieve the most recent activity', () => {
            return repository.findMostRecentActivity()
                .should.eventually.deep.equal(activity2);
        });
    });
    
    describe('find activities', () => {
        const startOfYear = moment().year(2017).startOf('year').unix();
        it('should retrieve by activity by year', () => {
            return repository.findActivities(startOfYear, 'swimming')
                .should.eventually.deep.equal([activity4, activity3]);
        });
        it('should retrieve all by year', () => {
            return repository.findActivities(startOfYear)
                .should.eventually.deep.equal([activity2, activity4, activity3, activity1]);
        });
    });

    function createActivity(date, activityId) {
        return {
            datetime: date,
            activity_id: activityId,
            distance:{"value":1750,"unit":"miles"},
            time_duration:{"value":13,"unit":"hours"}
        }
    }
});