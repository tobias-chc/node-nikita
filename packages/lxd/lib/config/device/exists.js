// Generated by CoffeeScript 2.7.0
// # `nikita.lxc.config.device.exists`

// Check if the device exists in a container.

// ## Output

// * `$status`
//   True if the device exist, false otherwise.

// ## Add a network interface

// ```js
// const {$status, config} = await nikita.lxc.config.device.exists({
//   container: "my_container",
//   device: 'eth0'
// })
// console.info($status ? `device exists, type is ${config.type}` : 'device missing')
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
      'device': {
        type: 'string',
        description: `Name of the device in LXD configuration, for example "eth0".`
      }
    },
    required: ['container', 'device']
  }
};

// ## Handler
handler = async function({config}) {
  var properties;
  ({properties} = (await this.lxc.config.device.show({
    container: config.container,
    device: config.device
  })));
  return {
    exists: !!properties,
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
