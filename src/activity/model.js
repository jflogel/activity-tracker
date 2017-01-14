const UNKNOWN = { id: 0, description: 'Unknown' };
const RUNNING = { id: 1, description: 'Running' };
const CORE = { id: 2, description: 'Core' };
const SWIMMING = { id: 3, description: 'Swimming' };
const WEIGHTS = { id: 4, description: 'Weights' };
const activities = [RUNNING, CORE, SWIMMING, WEIGHTS];

function getOrUnknown(activity) {
    return activity ? activity: UNKNOWN;
}

function getById(id) {
    const activity = activities.find(x => x.id === id);
    return getOrUnknown(activity);
}
function getByDescription(description) {
    const activity = activities.find(x => x.description.toLowerCase() === description.toLowerCase());
    return getOrUnknown(activity); 
}

exports.getByDescription = getByDescription;
exports.getById = getById;
exports.allActivities = activities;