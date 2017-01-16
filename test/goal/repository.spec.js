const chai = require('chai');
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
chai.use(require("chai-as-promised"));

describe('goal repository', () => {
    var repository;
    const goal1 = {"year":2017,"activity_id":1,"distance":{"value":1750,"unit":"miles"}},
        goal2 = {"year":2017,"activity_id":2,"time_duration":{"value":13,"unit":"hours"}},
        goal3 = {"year":2016,"activity_id":3,"time_duration":{"value":25,"unit":"hours"}};

    before((done) => {
        MongoClient.connect('mongodb://localhost:27017/activity_tracking_test', (err, database) => {
            if (err) return console.log(err)
            repository = require('./../../src/goal/repository')(database);

            database.collection('goal').drop();
            database.collection('goal').insert([goal1, goal2, goal3]);
            done();
        });
    });
    
    describe('find goals', () => {
        it('should retrieve goals by year', () => {
            return repository.findGoals(2017)
                .should.eventually.deep.equal([goal1, goal2]);
        });
    });
});