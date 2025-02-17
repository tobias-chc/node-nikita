// Generated by CoffeeScript 2.7.0
var crypto;

module.exports = {
  escapeshellarg: function(arg) {
    var result;
    result = arg.replace(/'/g, function(match) {
      return '\'"\'"\'';
    });
    return `'${result}'`;
  },
  /*
  `string.hash(file, [algorithm], callback)`
  ------------------------------------------
  Output the hash of a supplied string in hexadecimal
  form. The default algorithm to compute the hash is md5.
  */
  hash: function(data, algorithm) {
    if (arguments.length === 1) {
      algorithm = 'md5';
    }
    return crypto.createHash(algorithm).update(data).digest('hex');
  },
  repeat: function(str, l) {
    return Array(l + 1).join(str);
  },
  /*
  `string.endsWith(search, [position])`
  -------------------------------------
  Determines whether a string ends with the characters of another string,
  returning true or false as appropriate.
  This method has been added to the ECMAScript 6 specification and its code
  was borrowed from [Mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith)
  */
  endsWith: function(str, search, position) {
    var lastIndex;
    position = position || str.length;
    position = position - search.length;
    lastIndex = str.lastIndexOf(search);
    return lastIndex !== -1 && lastIndex === position;
  },
  lines: function(str) {
    return str.split(/\r\n|[\n\r\u0085\u2028\u2029]/g);
  },
  max: function(str, max) {
    if (str.length > max) {
      return str.slice(0, max) + '…';
    } else {
      return str;
    }
  },
  print_time: function(time) {
    if (time > 1000 * 60) {
      `${time / 1000}m`;
    }
    if (time > 1000) {
      return `${time / 1000}s`;
    } else {
      return `${time}ms`;
    }
  },
  snake_case: function(str) {
    return str.replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
  }
};

// nunjucks = require 'nunjucks/src/environment'
crypto = require('crypto');
