const inquirer = require('inquirer');

const questionsMaster = {
    apikey: {
        name: 'apikey',
        message: 'API Key:',
        validate: function (value) {
            if (value.length > 2) {
                return true;
            } else {
                return 'Please enter a valid Kontakt.io API Key'
            }
        }
    },
    env: {
        name: 'env',
        message: 'Environment:',
        type: 'list',
        choices: [
            {
                name: 'Test',
                value: 'test',
                short: 'Test'
            },
            {
                name: 'Accept',
                value: 'accept',
                short: 'Accept'
            },
            {
                name: 'Production',
                value: 'production',
                short: 'Production'
            }
        ],
        default: 0
    },
    source: {
        name: 'source',
        message: 'Data source:'
    },
    type: {
        name: 'type',
        message: 'Stream type:',
        type: 'list',
        choices: [
            {
                name: 'Presence data from a single Gateway or all Gateways in a Venue',
                value: 'presence',
                short: 'Presence'
            },
            {
                name: 'Location data from location frames of a beacon',
                value: 'location',
                short: 'Location'
            },
            {
                name: 'Sensors data from a single Beacon (except an accelerometer)',
                value: 'sensor',
                short: 'Sensor'
            },
            {
                name: 'Accelerometer data from a single Beacon',
                value: 'accelerometer',
                short: 'Accelerometer'
            },
            {
                name: 'Button press events from a button-equipped Beacon',
                value: 'button',
                short: 'Button'
            },
            {
                name: 'Health data from a single Beacon',
                value: 'health',
                short: 'Beacon Health'
            },
            {
                name: 'Complete Telemetry data from a single Beacon',
                value: 'all',
                short: 'Complete Telemetry'
            },
            {
                name: 'Complete Telemetry data from a all Beacons belonging to a given Company',
                value: 'telemetry',
                short: 'Company Telemetry'
            }
        ]
    },
    macs: {
        name: 'macs',
        message: 'Comma separated list of MAC address to filter:'
    },
    alias: {
        name: 'alias',
        message: 'Name for a preset (alphanumeric characters only, please):',
        validate: function (value) {
            if (value.length > 0) {
                return true;
            } else {
                return 'Please enter a valid name for your config'
            }
        }
    }
}

function askForMissingDetails(params, save) {
    const questions = [];

    for (const key in params) {
        if (params.hasOwnProperty(key) && params[key] === undefined) {
            questions.push(questionsMaster[key]);
        }
    }

    if (save) {
        questions.push(questionsMaster['alias']);
    }

    return inquirer.prompt(questions);
}

module.exports = {
    askForMissingDetails: askForMissingDetails
}
