// Generated by CoffeeScript 2.7.0
var utils;

utils = require('@nikitajs/core/lib/utils');

module.exports = function(err, stderr) {
  stderr = stderr.trim();
  if (utils.string.lines(stderr).length === 1) {
    return err.message = stderr;
  }
};
