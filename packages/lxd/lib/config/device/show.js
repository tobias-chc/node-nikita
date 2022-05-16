// Generated by CoffeeScript 2.7.0
// # `nikita.lxc.config.device.show`

// Show full device configuration for containers or profiles.

// ## Output parameters

// * `$status` (boolean)
//   True if the device was created or the configuraion updated.
// * `properties` (object)   
//   Device configuration.

// ## Example

// ```js
// const {properties} = await nikita.lxc.config.device.show({
//   container: 'container1',
//   device: 'vpn'
// })
// console.info(properties)
// // { connect: "udp:127.0.0.1:1194",
// // listen: "udp:51.68.116.44:1194",
// // type: proxy } }
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
  var data;
  ({data} = (await this.lxc.query({
    path: '/' + ['1.0', 'instances', config.container].join('/')
  })));
  return {
    $status: true,
    properties: data.devices[config.device]
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
