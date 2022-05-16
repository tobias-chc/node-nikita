// Generated by CoffeeScript 2.7.0
// # `nikita.lxc.stop`

// Stop a running Linux Container.

// ## Example

// ```js
// const { $status } = await nikita.lxc.stop({
//   container: "myubuntu",
//   wait: true,
//   wait_retry: 5,
// });
// console.info(`The container was stopped: ${$status}`);
// ```

// ## Schema definitions
var definitions, handler;

definitions = {
  config: {
    type: 'object',
    properties: {
      'container': {
        $ref: 'module://@nikitajs/lxd/lib/init#/definitions/config/properties/container'
      },
      'wait': {
        type: 'boolean',
        default: false,
        description: `Wait for container to be stopped before finishing action.`
      },
      'wait_retry': {
        type: 'integer',
        default: 3,
        description: `Maximum number of checks on container state, default to 3.`
      },
      'wait_interval': {
        type: 'integer',
        default: 2000,
        description: `Time interval between each container state check in ms, default to 2s.`
      }
    },
    required: ['container']
  }
};

// ## Handler
handler = async function({config}) {
  await this.execute({
    command: `lxc list -c ns --format csv | grep '${config.container},STOPPED' && exit 42
lxc stop ${config.container}`,
    code: [0, 42]
  });
  if (config.wait) {
    await this.execute.wait({
      $shy: true,
      command: `lxc info ${config.container} | grep 'Status: STOPPED'`,
      retry: config.wait_retry,
      interval: config.wait_interval
    });
  }
  return {};
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    definitions: definitions
  }
};
