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


const debouncer = {
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

const grouper = {
    cache: [],
    callback: (msg) => { },

    setCallback: function (callback) {
        this.callback = callback
    },

    add: function (msg) {
        this.cache.push(msg)
    },

    printOut: function () {
        if (this.cache.length > 0) {
            console.table(this.cache)
            if (this.callback) {
                this.callback(this.cache)
            }
            this.cache = []
        }
    }
}
setInterval(() => grouper.printOut(), 1000)

const diffReturn = {
    cache: {},
    testDifferent(reading) {
        let oldTime = diffReturn.cache[reading.deviceAddress]

        let newTime = reading.timestamp

        let different = newTime !== oldTime
        diffReturn.cache[reading.deviceAddress] = newTime

        return different
    }
}

module.exports = { debouncer, grouper, diffReturn, stringCmp, clearScreen }