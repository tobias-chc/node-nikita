// Generated by CoffeeScript 2.7.0
// # `nikita.file.properties.read`

// Read a file in the Java properties format.

// ## Example

// Use a custom delimiter with spaces around the equal sign.

// ```js
// const {properties} = await nikita.file.properties.read({
//   target: "/path/to/target.json",
//   separator: ' = '
// })
// console.info(`Properties:`, properties)
// ```

// ## Schema definitions
var definitions, handler, quote;

definitions = {
  config: {
    type: 'object',
    properties: {
      'comment': {
        type: 'boolean',
        default: false,
        description: `Preserve comments, key is the comment while value is "null".`
      },
      'encoding': {
        $ref: 'module://@nikitajs/file/lib/index#/definitions/config/properties/encoding',
        default: 'utf8'
      },
      'separator': {
        type: 'string',
        default: '=',
        description: `The caracter to use for separating property and value. '=' by default.`
      },
      'target': {
        oneOf: [
          {
            type: 'string'
          },
          {
            typeof: 'function'
          }
        ],
        description: `File to read and parse.`
      },
      'trim': {
        type: 'boolean',
        description: `Trim keys and value.`
      }
    },
    required: ['target']
  }
};

// ## Handler
handler = async function({config}) {
  var _, data, i, k, len, line, lines, properties, v;
  ({data} = (await this.fs.base.readFile({
    target: config.target,
    encoding: config.encoding
  })));
  properties = {};
  // Parse
  lines = data.split(/\r\n|[\n\r\u0085\u2028\u2029]/g);
  for (i = 0, len = lines.length; i < len; i++) {
    line = lines[i];
    if (/^\s*$/.test(line)) { // Empty line
      continue;
    }
    if (/^#/.test(line)) { // Comment
      if (config.comment) {
        properties[line] = null;
      }
      continue;
    }
    [_, k, v] = RegExp(`^(.*?)${quote(config.separator)}(.*)$`).exec(line);
    if (config.trim) {
      k = k.trim();
    }
    if (config.trim) {
      v = v.trim();
    }
    properties[k] = v;
  }
  return {
    properties: properties
  };
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    definitions: definitions
  }
};

// ## Dependencies
quote = require('regexp-quote');
