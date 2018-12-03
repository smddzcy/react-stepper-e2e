module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "extends": "airbnb-base",
  "parser": "babel-eslint",
  "rules": {
    "no-console": 0,
    "no-shadow": 0,
    "no-unused-vars": 1,
    "strict": 0,
    "max-len": 0,
    "no-param-reassign": 0,
    "vars-on-top": 0,
    "no-use-before-define": 1,
    "no-prototype-builtins": 0,
    "no-mixed-operators": 0,
    "no-bitwise": 0,
    "no-empty": 0,
    "prefer-destructuring": 0,
    "no-case-declarations": 0,
    "no-underscore-dangle": 0,
    "no-await-in-loop": 0,
    "no-unused-vars": ["warn"],
    "no-var": ["off"],
    "one-var": ["off"],
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  },
  "globals": {
    "describe": true,
    "it": true,
    "beforeEach": true,
    "afterEach": true,
    "browser": true,
  }
};
