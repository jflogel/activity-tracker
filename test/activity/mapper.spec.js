var chai = require('chai'),
  should = chai.should(),
  expect = chai.expect;
var mapper = require('./../../src/activity/mapper');

describe('mapper', () => {
  describe('should map to model', () => {
    var webActivity;
    beforeEach(() => {
      webActivity = { 
        date: '2017-01-14T00:00',
        activity: '1',
        duration: '21',
        distance: '3.5',
        distance_units: 'miles'
      };
    });
    it('with distance', () => {
      const model = mapper.mapToModel(webActivity);

      model.activity_id.should.equal(1);
      model.time_duration.should.deep.equal({value: 21, unit: 'minutes'});
      model.distance.should.deep.equal({value: 3.5, unit: 'miles'});
      model.datetime.should.equal(1484373600);
    });
    it('without distance', () => {
      delete webActivity.distance;
      delete webActivity.distance_units;

      const model = mapper.mapToModel(webActivity);

      expect(model.distance).to.be.undefined;
    });
  });
  describe('should map to dto', () => {
    var model;
    beforeEach(() => {
      model = {
        _id: 34,
        activity_id: 3,
        datetime: 1484454241,
        time_duration: {value:35, unit:'minutes'},
        distance: {value:5, unit:'miles'}
      };
    });

    it('with distance', () => {
      const dto = mapper.mapToDTO(model);

      dto.activity.should.equal('Swimming');
      dto.time_duration.should.equal(35);
      dto.distance.should.equal(5);
      dto.distance_units.should.equal('miles');
      dto.date.should.equal(1484454241000);
    });
    it('without distance', () => {
      delete model.distance;

      const dto = mapper.mapToDTO(model);

      expect(dto.distance).to.be.undefined;
      expect(dto.distance_units).to.be.undefined;
    });
  });
});