// Generated by CoffeeScript 2.7.0
// # `nikita.system.mod`

// Load a kernel module. By default, unless the `persist` config is "false",
// module are loaded on reboot by writing the file "/etc/modules-load.d/{name}.conf".

// ## Examples

// Activate the module "vboxpci" in the file "/etc/modules-load.d/vboxpci.conf":

// ```
// nikita.system.mod({
//   modules: 'vboxpci'
// })
// ```

// Activate the module "vboxpci" in the file "/etc/modules-load.d/my_modules.conf":

// ```
// nikita.system.mod({
//   target: 'my_modules.conf',
//   modules: 'vboxpci'
// });
// ```

// ## Hooks
var definitions, handler, on_action, path, quote;

on_action = function({config}) {
  if (typeof config.modules === 'string') {
    return config.modules = {
      [config.modules]: true
    };
  }
};

// ## Schema definitions
definitions = {
  config: {
    type: 'object',
    properties: {
      'load': {
        type: 'boolean',
        default: true,
        description: `Load the module with \`modprobe\`.`
      },
      'modules': {
        oneOf: [
          {
            type: 'string'
          },
          {
            type: 'object',
            patternProperties: {
              '.*': {
                type: 'boolean'
              }
            },
            additionalProperties: false
          }
        ],
        description: `Names of the modules.`
      },
      'persist': {
        type: 'boolean',
        default: true,
        description: `Load the module on startup by placing a file, see \`target\`.`
      },
      'target': {
        type: 'string',
        description: `Path of the file to write the module, relative to
"/etc/modules-load.d" unless absolute, default to
"/etc/modules-load.d/{config.modules}.conf".`
      }
    },
    required: ['modules']
  }
};

// ## Handler
handler = async function({metadata, config}) {
  var active, module, ref, target;
  ref = config.modules;
  for (module in ref) {
    active = ref[module];
    target = config.target;
    if (target == null) {
      target = `${module}.conf`;
    }
    target = path.resolve('/etc/modules-load.d', target);
    await this.execute({
      $if: config.load && active,
      command: `lsmod | grep ${module} && exit 3
modprobe ${module}`,
      code: [0, 3]
    });
    await this.execute({
      $if: config.load && !active,
      command: `lsmod | grep ${module} || exit 3
modprobe -r ${module}`,
      code: [0, 3]
    });
    await this.file({
      $if: config.persist,
      target: target,
      match: RegExp(`^${quote(module)}(\\n|$)`, "mg"),
      replace: active ? `${module}\n` : '',
      append: true,
      eof: true
    });
  }
  return void 0;
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    definitions: definitions,
    argument_to_config: 'modules'
  }
};

// ## Dependencies
path = require('path');

quote = require('regexp-quote');
