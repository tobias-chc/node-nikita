// Generated by CoffeeScript 2.7.0
// # `nikita.docker.restart`

// Start stopped containers or restart (stop + starts) a started container.

// ## Output

// * `err`   
//   Error object if any.   
// * `$status`   
//   True if container was restarted.  

// ## Example

// ```js
// const {$status} = await nikita.docker.restart({
//   container: 'toto'
// })
// console.info(`Container was started or restarted: ${$status}`)
// ```

// ## Schema definitions
var definitions, handler;

definitions = {
  config: {
    type: 'object',
    properties: {
      'container': {
        type: 'string',
        description: `Name/ID of the container.`
      },
      'docker': {
        $ref: 'module://@nikitajs/docker/lib/tools/execute#/definitions/docker'
      },
      'timeout': {
        type: 'integer',
        description: `Seconds to wait for stop before killing it.`
      }
    },
    required: ['container']
  }
};

// ## Handler
handler = async function({config}) {
  return (await this.docker.tools.execute({
    command: ['restart', config.timeout != null ? `-t ${config.timeout}` : void 0, `${config.container}`].join(' ')
  }));
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    global: 'docker',
    definitions: definitions
  }
};
