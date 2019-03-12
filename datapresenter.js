const chalk  = require('chalk');
require('console.table')

function clearScreen() {
    process.stdout.write('\x1b[0f');
    process.stdout.write('\x1b[2J');
}

function stringCmp(a, b) {
    if (a > b) {
        return 1;
    }
    if (a < b) {
        return -1;
    }
    return 0;
}

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

let debouncer = {
    cache: {},

    add: (msg) => {
        let obj = debouncer.cache[msg.sourceId] || {}
        let augmented = Object.assign(obj, msg)
        debouncer.cache[msg.sourceId] = augmented
    },

    printOut: () => {
        if (Object.keys(debouncer.cache).length > 0) {
            clearScreen()
            console.log('Messages at ', Date.now() / 1000)
            console.log('')
            let table = Object.values(debouncer.cache)
            table.sort((a,b) => stringCmp(a.sourceId, b.sourceId))
            console.table(table)
            debouncer.cache = {}
        }
    }
}
setInterval(() => debouncer.printOut(), 1000)


function handle(message, streamType, macs) {
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