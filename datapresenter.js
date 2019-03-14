const chalk = require('chalk');
const { debouncer, grouper, diffReturn, stringCmp, clearScreen } = require('./grouping')
require('console.table')

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

function handle(message, streamType, topic, macs) {
    const jsonString = message.toString();
    const json = JSON.parse(jsonString);

    switch (streamType) {
        case 'presence':
            let filtered = (macs.size > 0) ? json.filter(m => macs.has(m.deviceAddress)) : json
            filtered.sort((a, b) => stringCmp(a.deviceAddress, b.deviceAddress))

            if (filtered.length > 0) {
                clearScreen()
                console.log('Messages at ', Date.now() / 1000)
                console.log('')
                console.table(filtered)
            }
            break;
        case 'location':
            if (Object.keys(json).length > 0) {
                json.timestamp /= 1000.0
                grouper.add(json)
            }
            break;
        case 'health':
        case 'accelerometer':
        case 'sensor':
        case 'button':
            showStaticStreamData(json);
            break;
        default:
            debouncer.add(json)
            break;
    }

    return json
}

module.exports = {
    handle: handle
}