#!/usr/bin/env node
const mqttClient    = require('./mqttclient');
const Configstore   = require('configstore');
const pkg           = require('./package.json');
const program       = require('commander');
const inquirer      = require('./inquirer');
const chalk         = require('chalk');
const assetBuilder  = require('./assetbuilder');
const conf          = new Configstore(pkg.name);

let manualMode = true;

program
    .version(pkg.version)
    .option('-a, --apikey <apikey>', 'API key')
    .option('-e, --env <env>', 'environment: ' + chalk.blue('test') + ', ' + chalk.blue('accept') + ' or ' + chalk.blue('production'), /^(test|accept|production)$/i)
    .option('-s, --source <source>', 'source of data for a stream: Unique ID, UUID, MAC address, etc.')
    .option('-t, --type <type>', 'type of a stream: ' + chalk.blue('presence') + ', ' + chalk.blue('health') + ', ' + chalk.blue('accelerometer') + ', ' + chalk.blue('sensor') + ', ' + chalk.blue('button') + ', ' + chalk.blue('telemetry') + ' or ' + chalk.blue('all'), /^(presence|health|accelerometer|sensor|button|telemetry|all)$/i)
    .option('-d, --dont-save', 'do not ask for saving a config')
    .option('-c, --clear', 'remove all saved configs')
    .option('--macs <maclist>', 'list of comma separated MAC addresses');

program
    .command('run <alias>')
    .description('start a stream from a predefined config')
    .action(function (alias) {
        console.log('Looking for a predefined config: ' + chalk.bold.magenta(alias));
        const savedConfig = conf.get(alias);
        if (savedConfig === undefined) {
            console.warn('✘ Predefined config ' + chalk.bold.magenta(alias) + ' not found.\n' + chalk.keyword('orange')('Switching to the manual mode…'));
        } else {
            console.log(chalk.green('✔︎ Config found, starting a stream:'));
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

program
    .command('delete <alias>')
    .description('remove a predefined config')
    .action(function (alias) {
        if (conf.has(alias)) {
            conf.delete(alias);
            console.log(chalk.green('✔︎ Config deleted'));
            process.exit(0);
        } else {
            console.warn('✘ Predefined config ' + chalk.bold.magenta(alias) + ' not found.');
            process.exit(1);
        }
    });

program.on('command:*', function () {
    console.error(chalk.red('Invalid command: ' + program.args.join(' ')) + '\nSee ' + chalk.yellow.bold('--help') + ' for a list of available commands.');
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
        type: program.type,
        source: program.source,
        macs: program.macs
    }

    let answers = inquirer.askForMissingDetails(streamParameters, save);

    answers.then(missingData => {
        return assetBuilder.getMissingCompanyId(missingData).then(source => {
            missingData.source = source;
            return missingData;
        });
    }).then(missingData => {
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
