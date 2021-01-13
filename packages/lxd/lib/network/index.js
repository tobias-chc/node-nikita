// Generated by CoffeeScript 2.5.1
// # `nikita.lxd.network`

// Create a network or update a network configuration

// ## Output

// * `err`
//   Error object if any
// * `status`
//   True if the network was created/updated

// ## Example

// ```js
// const {status} = await nikita.lxd.network({
//   network: 'lxbr0'
//   config: {
//     'ipv4.address': '172.89.0.0/24',
//     'ipv6.address': 'none'
//   }
// })
// console.info(`Network was created: ${status}`)
// ```

// ## Schema
var diff, handler, merge, schema, yaml;

schema = {
  type: 'object',
  properties: {
    'network': {
      type: 'string',
      description: `The network name to create.`
    },
    'properties': {
      type: 'object',
      properties: {
        'dns.domain': {
          type: 'string',
          format: 'hostname',
          description: `Domain to advertise to DHCP clients and use for DNS resolution.
Note, single label domains like \`nikita\` are supported by LXD but
are not valid. For exemple, FreeIPA will fail to Initialize. Use
\`nikita.local\` instead.`
        }
      },
      patternProperties: {
        '': {
          type: ['string', 'boolean', 'number']
        }
      },
      description: `The network configuration, see [available
fields](https://lxd.readthedocs.io/en/latest/networks/).`
    }
  },
  required: ['network']
};

// ## Handler
handler = async function({config}) {
  var changes, code, current, k, key, ref, status, stdout, v, value;
  ref = config.properties;
  // Normalize config
  for (k in ref) {
    v = ref[k];
    if (typeof v === 'string') {
      continue;
    }
    config.properties[k] = v.toString();
  }
  // Command if the network does not yet exist
  ({stdout, code, status} = (await this.execute({
    // return code 5 indicates a version of lxc where 'network' command is not implemented
    command: `lxc network > /dev/null || exit 5
lxc network show ${config.network} && exit 42
${[
      'lxc',
      'network',
      'create',
      config.network,
      ...((function() {
        var ref1,
      results;
        ref1 = config.properties;
        results = [];
        for (key in ref1) {
          value = ref1[key];
          results.push(`${key}='${value.replace('\'',
      '\\\'')}'`);
        }
        return results;
      })())
    ].join(' ')}`,
    code_skipped: [5, 42]
  })));
  if (code === 5) {
    throw Error("This version of lxc does not support the network command.");
  }
  if (code !== 42) { // was created
    return {
      status: status
    };
  }
  // Network already exists, find the changes
  if (!(config != null ? config.properties : void 0)) {
    return;
  }
  current = yaml.safeLoad(stdout);
  changes = diff(current.config, merge(current.config, config.properties));
  for (key in changes) {
    value = changes[key];
    ({status} = (await this.execute({
      command: ['lxc', 'network', 'set', config.network, key, `'${value.replace('\'', '\\\'')}'`].join(' ')
    })));
  }
  return {
    status: status
  };
};

// ## Export
module.exports = {
  handler: handler,
  metadata: {
    schema: schema
  }
};

// ## Dependencies
yaml = require('js-yaml');

diff = require('object-diff');

({merge} = require('mixme'));
