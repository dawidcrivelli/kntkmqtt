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

// const macs = new Set(['da:fb:81:c4:63:63', 'f3:c9:1b:0f:2f:3a', 'ce:1c:87:3a:da:f0', 'd3:c5:b0:e8:94:2c', 'f4:b8:5e:ac:5a:87', 'f4:b8:5e:ac:4e:68', 'e3:44:47:a3:9d:71', 'eb:5f:62:1c:90:07', '60:c0:bf:0d:6b:1b', 'e2:02:00:1e:e3:40', 'e2:02:00:2d:f4:40', 'e3:44:47:a3:9d:71', 'e8:7a:4c:fc:04:72', 'ea:96:9d:79:41:64'])
const macs = new Set()

function handle(message, streamType) {
    const jsonString = message.toString();
    const json = JSON.parse(jsonString);

    switch (streamType) {
        case 'presence':
            let filtered = (macs.size > 0) ? json.filter(m => macs.has(m.deviceAddress)) : json
            filtered.sort((a, b) => stringCmp(a.deviceAddress, b.deviceAddress))
            clearScreen()
            console.table(filtered)
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