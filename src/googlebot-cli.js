#!/usr/bin/env node

/* eslint no-console: off */

import winston from 'winston';
import chalk from 'chalk';
import googlebot from './googlebot';
import pkg from '../package.json';

if (['help', '--help', '-h', 'version', '--version', '-v'].includes(process.argv[2])) {
    console.log(`
      ${chalk.bgMagenta(`googlebot v${pkg.version}`)}

      Usage:

      ${chalk.cyan('googlebot')}

      Configuration through environment variables:

      ${chalk.cyan('GOOGLEBOT_TOKEN')}         - ${chalk.grey('(Mandatory)')} The Slack Bot User OAuth Access Token for your organisation/team
      ${chalk.cyan('GOOGLEBOT_CATEGORIES')}    - ${chalk.grey('(Optional)')} A coma separated list to enable special joke categories like "rude" and "kind" (${chalk.grey('Default')}: "kind")
      ${chalk.cyan('GOOGLEBOT_MESSAGE_COLOR')} - ${chalk.grey('(Optional)')} The hex color used by the bot to mark it's messages (${chalk.grey('Default')}: "#590088")
  `);
  process.exit(0);
}

const logger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({
      timestamp() {
        return (new Date()).toISOString();
      },
    }),
  ],
});

logger.cli();

if (!process.env.GOOGLEBOT_TOKEN) {
  logger.error('You must setup the GOOGLEBOT_TOKEN environment variable before running the bot');
  process.exit(1);
}

const options = { logger };
if (process.env.GOOGLEBOT_TRIGGERS) {
  options.triggerOnWords = process.env.GOOGLEBOT_TRIGGERS.split(',');
}
if (process.env.GOOGLEBOT_CATEGORIES) {
  options.specialCategories = process.env.GOOGLEBOT_CATEGORIES.split(',');
}
if (process.env.GOOGLEBOT_NO_PICTURES) {
  options.usePictures = false;
}
if (process.env.GOOGLEBOT_MESSAGE_COLOR) {
  options.messageColor = process.env.GOOGLEBOT_MESSAGE_COLOR;
}

const bot = googlebot(process.env.GOOGLEBOT_TOKEN, options);
bot.start();