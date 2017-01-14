var moment = require('moment');
var model = require('./model');

function mapToModel(webActivity) {
    var newActivity = {
        datetime: moment(webActivity.date).unix(), 
        activity_id: parseInt(webActivity.activity), 
        time_duration:{
            value: parseInt(webActivity.duration), unit: "minutes"
        }
    };
    if (webActivity.distance) {
        newActivity.distance = {value: parseInt(webActivity.distance), unit: webActivity.distance_units};
    }
    return newActivity;
}
function mapToDTO(mongoActivity) {
    var myActivity = {
        id: mongoActivity._id,
        activity: model.getById(mongoActivity.activity_id).description,
        date: mongoActivity.datetime * 1000,
        time_duration: mongoActivity.time_duration.value
    };
    if (mongoActivity.distance) {
        myActivity.distance = mongoActivity.distance.value;
        myActivity.distance_units = mongoActivity.distance.unit;
    }
    return myActivity;
}

exports.mapToModel = mapToModel;
exports.mapToDTO = mapToDTO;