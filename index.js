#!/usr/bin/env node
const mqttClient    = require('./mqttclient');
const Configstore   = require('configstore');
const pkg           = require('./package.json');
const program       = require('commander');
const inquirer      = require('./inquirer');

const conf = new Configstore(pkg.name);

let manualMode = true;

program
    .version(pkg.version)
    .option('-a, --apikey <apikey>', 'API key')
    .option('-e, --env <env>', 'environment: test, accept or production', /^(test|accept|production)$/i)
    .option('-s, --source <source>', 'source of data for a stream: Unique ID, UUID, MAC address, etc.')
    .option('-t, --type <type>', 'type of a stream: presence, health, accelerometer, sensor, button, telemetry or all', /^(presence|health|accelerometer|sensor|button|telemetry|all)$/i)
    .option('-d, --dont-save', 'do not ask for saving a config')
    .option('-c, --clear', 'remove all saved configs');

program
    .command('run <alias>')
    .description('start a stream from a predefined config')
    .action(function (alias) {
        console.log('Looking for a predefined config: ' + alias);
        const savedConfig = conf.get(alias);
        if (savedConfig === undefined) {
            console.warn('Predefined config ' + alias + ' not found.\nSwitching to the manual mode…');
        } else {
            console.log('Config found, starting a stream:');
            manualMode = false;
            mqttClient.startStream(savedConfig);
        }
    });

program
    .command('list')
    .description('list all saved configs')
    .action(function () {
        console.log('Listing all predefined configs:');
        console.log(conf.all);
        process.exit(0);
    });

program.on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
});

program.parse(process.argv);

if (program.clear) {
    conf.clear();
    console.log('All saved configs have been removed.');
    process.exit(0);
}

if (manualMode) {
    const save = !program.dontSave;

    const streamParameters = {
        apikey: program.apikey,
        env: program.env,
        source: program.source,
        type: program.type
    }

    let answers;

    if (save) {
        answers = inquirer.askForMissingDetails(streamParameters);
    } else {
        answers = inquirer.askForMissingDetails(streamParameters, program.dontSave);
    }

    answers.then(missingData => {
        for (const key in missingData) {
            if (missingData.hasOwnProperty(key) && key !== 'alias') {
                streamParameters[key] = missingData[key];
            }
        }
        
        if (save) {
            conf.set(missingData['alias'], streamParameters)
        }
        
        mqttClient.startStream(streamParameters);
    });
}
