#!/usr/bin/env node


/**
 * Build command generates an extension dist/ directory that
 * can be debugged in the browser.
 *
 * When called with production env flag, -e prod, this command
 * will minify and compile a zip file that can be uploaded to
 * the web store for distribution.
 *
 * @namespace xt-build
 *
 * @example <caption>Run development build and watch changes</caption>
 * npx xt-build -e dev -w
 *
 * @example <caption>Build production version</caption>
 * npx xt-build -e prod
 *
 * @example <caption>Get help using this command</caption>
 * npx xt-build --help
 */

const util = require('util');
const path = require('path');
const chalk = require('chalk');
const program = require('commander');
const Spinner = require('cli-spinner').Spinner;
const exec = require('child_process').exec;
const pkg = require('../package.json');
const env = {prod: 'prod', dev: 'dev'};
const gulpfile = path.resolve(__dirname, '../config/gulpfile.js');

program
    .version(pkg.version)
    .option('-e --env <env>', 'Environment', /^(dev|prod)$/i, env.prod)
    .option('-c --config <config>', 'Path to configuration file,  ' +
        'default: .xtbuild.json in root, or xtbuild in package.json)', /^(.*)$/i)
    .option('-w --watch', 'Enable watch')
    .parse(process.argv);

const args = [
    program.watch ? 'gulp watch' : 'gulp',
    util.format('--gulpfile "%s"', gulpfile),
    util.format('--config "%s"', path.resolve(process.cwd(), program.config || './.xtbuild.json')),
    util.format('--pkg', path.resolve(process.cwd(), './package.json')),
    util.format('--%s', program.env),
    '--colors'
].join(' ');

const spinner = (!program.watch) ? new Spinner(' %s ') : null;

if (spinner) spinner.start();

const bat = exec(args);

bat.stdout.on('data', (data) => {
    process.stdout.write(data.toString());
});

bat.stderr.on('data', (data) => {
    if (spinner) spinner.stop(true);
    process.stdout.write(data.toString());
});

bat.on('exit', (code) => {
    if (spinner) spinner.stop(true);
    if (!code) {
        console.log(chalk.bold.green('Build done'));
    } else {
        console.log(chalk.bold.red('Build failed'));
    }
});
