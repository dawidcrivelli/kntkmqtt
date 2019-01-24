const semver = require('semver');

function present(message, streamType) {
    const jsonString = message.toString();
    const json = JSON.parse(jsonString);
    switch (streamType) {
        case 'presence':
            if (semver.gte(process.version, '10.0.0')) {
                console.table(json)
            } else {
                console.log(json);
            }
            break;
    
        default:
            console.log(json);
            break;
    }
}

module.exports = {
    present: present
}