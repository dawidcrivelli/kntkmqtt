const mqtt          = require('mqtt');
const assetBuilder  = require('./assetbuilder');
const os            = require('os');

function startStream(streamConfig) {
    const connectionOptions = {
        username: os.hostname() + '-' + os.platform() + '-' + os.arch(),
        password: streamConfig.apikey
    }
    
    const broker = assetBuilder.makeURL(streamConfig.env);
    const streamTopic = assetBuilder.makeTopic(streamConfig.type, streamConfig.source);

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
