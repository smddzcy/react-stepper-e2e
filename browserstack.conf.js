require('dotenv').config();

exports.config = {
  user: process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
  key: process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACC_KEY',

  updateJob: false,
  specs: [
    './specs/**/*.spec.js',
  ],
  exclude: [],

  maxInstances: 1,
  commonCapabilities: {
    build: 'webdriver-browserstack',
  },

  capabilities: [{
    os: 'OS X',
    os_version: 'Mojave',
    browserName: 'Chrome',
  },
  // {
  //   browserName: 'firefox',
  // }, {
  //   browserName: 'ie-11',
  // }, {
  //   browserName: 'safari',
  // }
  ],

  logLevel: 'command',
  coloredLogs: true,
  screenshotPath: './errorShots/',
  baseUrl: '',
  waitforTimeout: 30000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  host: 'hub.browserstack.com',

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
};
