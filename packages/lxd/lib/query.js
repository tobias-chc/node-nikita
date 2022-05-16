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
//   -d, --data      Input data
//       --raw       Print the raw response
//   -X, --request   Action (defaults to GET) (default "GET")
//       --wait      Wait for the operation to complete
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
      }
    }
  }
};

// ## Handler
handler = async function({config}) {
  var stdout;
  ({stdout} = (await this.execute({
    command: ['lxc', 'query', config.path].join(' ')
  })));
  return {
    $status: true,
    data: JSON.parse(stdout)
  };
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    definitions: definitions,
    shy: true
  }
};
