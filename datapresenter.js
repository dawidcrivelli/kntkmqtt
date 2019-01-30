const semver = require('semver');
const chalk  = require('chalk');

function showStaticStreamData(data, previousData) {
    if (Object.keys(data).length > 0) {
        console.log('Key'.padEnd(20) + 'Value'.padEnd(20) + 'Old value\n');
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const paddedKey = key.padEnd(20);
                let paddedCurrentValue = '';

                if (data[key] !== null) {
                    paddedCurrentValue = data[key].toString().padEnd(20);
                } else {
                    paddedCurrentValue = 'null'.padEnd(20);
                }
                
                if (data[key] === previousData[key] || previousData[key] === undefined) {
                    console.log(paddedKey + paddedCurrentValue);
                } else {
                    let paddedOldValue = '';

                    if (paddedOldValue !== null) {
                        paddedOldValue = previousData[key].toString().padEnd(20);
                    } else {
                        paddedOldValue = 'null'.padEnd(20);
                    }
                    
                    console.log(chalk.bold(paddedKey + chalk.green(paddedCurrentValue) + paddedOldValue));
                }
            }
        }
    } else {
        console.log(chalk.yellow('\nMessage with no data'));
    }
}

function showDynamicStreamData(data, previousData) {
    
}

function handle(message, streamType, previousMessage) {
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
        case 'health':
        case 'accelerometer':
        case 'sensor':
        case 'button':
            showStaticStreamData(json, previousMessage);
            break;
        default:
            console.log(json);
            break;
    }

    return json
}

module.exports = {
    handle: handle
}