const mqtt = require('mqtt');

function startStream(streamConfig) {
    const connectionOptions = {
        username: 'azaz', // TODO: Find a way to generate something more useful
        password: streamConfig.apikey
    }
    
    const broker = 'mqtt://testmqtt.kontakt.io:1883';
    const streamTopic = '/presence/stream/zYwiz';

    const client = mqtt.connect(broker, connectionOptions);

    client.on('connect', function(connack) {
        console.log(connack);
        client.subscribe(streamTopic, function (error, granted) {
            if (!error) {
                console.log(granted);
            } else {
                console.error(error);
            }
        });
    });
    
    client.on('error', function(error) {
        console.error(error);
        process.exit(1);
    });
    
    client.on('message', function(topic, message, packet) {
        const jsonString = message.toString();
        const json = JSON.parse(jsonString);
        console.log(json);
    });
}

module.exports = {
    startStream: startStream
};
