const inquirer = require('inquirer');

const questionsMaster = {
    apikey: {
        name: 'apikey',
        message: 'API Key',
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
        message: 'Environment',
        type: 'list',
        choices: [
            {
                name: 'Test',
                value: 'test',
                short: 'Short Test'
            },
            {
                name: 'Accept',
                value: 'accept',
                short: 'Short Accept'
            },
            {
                name: 'Production',
                value: 'production',
                short: 'Short Prod'
            }
        ],
        default: 0
    },
    source: {
        name: 'source',
        message: 'Data source'
    },
    type: {
        name: 'type',
        message: '',
        type: 'list',
        choices: [
            {
                name: 'Presence data from a single Gateway or all Gateways in a Venue',
                value: 'presence',
                short: 'Presence'
            },
            {
                name: 'Sensors data from a single Beacon (except an accelerometer)',
                value: 'sensor',
                short: 'Sensor'
            }
        ]
    },
    alias: {
        name: 'alias',
        message: 'Name for a preset (alphanumeric characters only, please)'
    }
}

function askForMissingDetails(params, save = true) {
    const questions = [];

    for (const key in params) {
        if (params.hasOwnProperty(key) && params[key] === 'undefined') {
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
