function makeTopic(type, source) {
    switch (type) {
        case 'presence':
            // TODO: Find a better way to differentiate between a device and a venue
            if (source.length < 25) {
                return '/presence/stream/' + source;
            } else {
                return '/stream/' + source + 'presence'
            }
        case 'health':
        case 'accelerometer':
        case 'sensor':
        case 'button':
            return '/stream/' + source + '/' + type;
        default:
            console.error('Unknown stream type');
            process.exit(1);
    }
}

function makeURL(env) {
    switch (env) {
        case 'production':
            return 'mqtts://mqtt.kontakt.io:8083';
        case 'accept':
            return 'mqtts://acceptmqtt.kontakt.io:8083';
        case 'test':
            return 'mqtts://testmqtt.kontakt.io:8083';
        default:
            console.error('Unknown environment');
            process.exit(1);
    }
}

module.exports = {
    makeTopic: makeTopic,
    makeURL: makeURL
}