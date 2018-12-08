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

  capabilities: [
    {
      os: 'OS X',
      os_version: 'Mojave',
      browserName: 'Chrome',
    },
    {
      browserName: 'IE',
      browser_version: '11.0',
    },
    // {
    //   browserName: 'iPhone',
    //   device: 'iPhone 8',
    //   realMobile: 'true',
    //   os_version: '11.0',
    // },
  ],

  logLevel: 'result',
  coloredLogs: true,
  screenshotPath: './errorShots/',
  baseUrl: '',
  waitforTimeout: 10000,
  aitforInterval: 250,
  connectionRetryTimeout: 60000,
  connectionRetryCount: 3,
  host: 'hub.browserstack.com',

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 40000,
  },
};
