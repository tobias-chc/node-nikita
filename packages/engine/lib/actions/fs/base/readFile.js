// Generated by CoffeeScript 2.5.1
// # `nikita.fs.readFile(options, callback)`

// Options:

// * `target` (string)   
//   Path of the file to read; required.
// * `encoding` (string)
//   Return a string with a particular encoding, otherwise a buffer is returned; 
//   optional.

// Exemple:

// ```js
// {data} = await nikita.fs.readFile({
//   target: "#{scratch}/a_file",
//   encoding: 'ascii'
// })
// console.log(data)
// ```

// ## Hook
var handler, on_action, schema;

on_action = function({config, metadata}) {
  if (metadata.argument != null) {
    return config.target = metadata.argument;
  }
};

// ## schema
schema = {
  type: 'object',
  properties: {
    'encoding': {
      type: 'string',
      enum: require('../../../utils/schema').encodings,
      description: `The encoding used to decode the buffer into a string. The encoding can
be any one of those accepted by Buffer. When not defined, this action
return a Buffer instance.`
    },
    'target': {
      oneOf: [
        {
          type: 'string'
        },
        {
          instanceof: 'Buffer'
        }
      ],
      description: `Source location of the file to read.`
    }
  },
  required: ['target']
};

// ## Handler
handler = async function({config}) {
  var buffers, data;
  // Normalize options
  buffers = [];
  await this.fs.base.createReadStream({
    target: config.target,
    on_readable: function(rs) {
      var buffer, results;
      results = [];
      while (buffer = rs.read()) {
        results.push(buffers.push(buffer));
      }
      return results;
    }
  });
  data = Buffer.concat(buffers);
  if (config.encoding) {
    data = data.toString(config.encoding);
  }
  return {
    data: data
  };
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    log: false,
    raw_output: true
  },
  schema: schema
};
