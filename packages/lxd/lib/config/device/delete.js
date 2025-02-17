// Generated by CoffeeScript 2.7.0
// # `nikita.lxc.config.device.delete`

// Delete a device from a container

// ## Output

// * `$status`
//   True if the device was removed False otherwise.

// ## Example

// ```js
// const {$status} = await nikita.lxc.config.device.delete({
//   container: 'container1',
//   device: 'root'
// })
// console.info(`Device was removed: ${$status}`)
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
  var $status, properties;
  ({properties} = (await this.lxc.config.device.show({
    container: config.container,
    device: config.device
  })));
  if (!properties) {
    return {
      $status: false
    };
  }
  ({$status} = (await this.execute({
    command: ['lxc', 'config', 'device', 'remove', config.container, config.device].join(' ')
  })));
  return {
    $status: $status
  };
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    definitions: definitions
  }
};
