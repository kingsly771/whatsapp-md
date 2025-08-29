// plugins/index.js
const generalPlugins = require('./general');
const otakuPlugins = require('./otaku');

// Combine all plugins
const allPlugins = {
  ...generalPlugins,
  ...otakuPlugins
};

module.exports = allPlugins;
