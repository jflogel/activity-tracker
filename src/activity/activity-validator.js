function validate(requestBody) {
    var errors = [];

    if (!requestBody.date) {
        errors.push('Please enter a date.');
    }

    const durationInMinutes = requestBody.duration ? parseInt(requestBody.duration) : 0;

    if (durationInMinutes === 0) {
        errors.push('Please enter a duration.');
    }

    return errors;
}

exports.validate = validate;