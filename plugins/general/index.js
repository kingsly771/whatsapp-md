// plugins/general/index.js
const autoReply = require('./autoReply');
const messageLogger = require('./messageLogger');
const help = require('./help');

module.exports = {
  autoReply,
  messageLogger,
  help
};
