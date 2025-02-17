// Generated by CoffeeScript 2.7.0
// # `nikita.lxc.query`

// Send a raw query to LXD.

// ## Example

// ```js
// const { data } = await nikita.lxc.query({
//   path: "/1.0/instances/c1",
// });
// console.info(`Container c1 info: ${data}`);
// ```

// ## TODO

// The `lxc query` command comes with a few flag which we shall support:

// ```
// Flags:
//       --raw       Print the raw response
// ```

// ## Schema definitions
var definitions, handler;

definitions = {
  config: {
    type: 'object',
    properties: {
      'path': {
        type: 'string',
        description: `The API path in the form of \`[<remote>:]<API path>\`, for example
\`/1.0/instances/c1\``
      },
      'wait': {
        type: 'boolean',
        default: false,
        description: `If true, activates the wait flag that waits for the operation to complete.`
      },
      'request': {
        enum: ['GET', 'PUT', 'DELETE', 'POST', 'PATCH'],
        default: 'GET',
        description: `Action to use for the API call.`
      },
      'data': {
        type: 'string',
        description: `Data to send to the action in the form of application/json stringified object.`
      },
      'format': {
        type: 'string',
        enum: ['json', 'string'],
        default: 'json',
        description: `Format to use for the output data, either \`json\` or \`string\`.`
      }
    },
    required: ['path']
  }
};

// ## Handler
handler = async function({config}) {
  var $status, stdout;
  ({$status, stdout} = (await this.execute({
    command: ['lxc', 'query', config.wait ? "--wait" : void 0, "--request", config.request, config.data != null ? `--data '${config.data}'` : void 0, config.path, "|| exit 42"].join(' '),
    code: [0, 42]
  })));
  ({
    $status: $status
  });
  switch (config.format) {
    case 'json':
      if ($status) {
        return {
          data: JSON.parse(stdout)
        };
      } else {
        return {
          data: {}
        };
      }
      break;
    case 'string':
      if ($status) {
        return {
          data: stdout
        };
      } else {
        return {
          data: ""
        };
      }
  }
};


// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    definitions: definitions,
    shy: true
  }
};
