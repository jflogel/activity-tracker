const chai = require('chai'),
  should = chai.should(),
  expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
chai.use(chaiAsPromised);

describe('goal repository', () => {
    var dataSource;
    var repository;
    const goal1 = {"year":2017,"activity_id":1,"distance":{"value":1750,"unit":"miles"}},
        goal2 = {"year":2017,"activity_id":2,"time_duration":{"value":13,"unit":"hours"}};

    before((done) => {
        MongoClient.connect('mongodb://localhost:27017/activity_tracking_test', (err, database) => {
            if (err) return console.log(err)
            dataSource = database;
            repository = require('./../../src/goal/repository')(database);

            dataSource.collection('goal').drop();
            dataSource.collection('goal').insert([goal1, goal2]);
            done();
        });
    });
    
    describe('find goals', () => {
        it('should retrieve goals', () => {
            return repository.findGoals()
                .should.eventually.deep.equal([goal1, goal2]);
        });
    });
});