// Generated by CoffeeScript 2.5.1
// # `nikita.docker.tools.execute`

// Execute a docker command.

// ## Schema
var handler, i, len, property, ref, schema, utils;

schema = {
  type: 'object',
  properties: {
    'boot2docker': {
      type: 'boolean',
      default: false,
      description: `Whether to use boot2docker or not.`
    },
    'compose': {
      type: 'boolean',
      description: `Use the \`docker-compose\` command instead of \`docker\`.`
    },
    'machine': {
      type: 'string',
      description: `Name of the docker-machine, required if using docker-machine.`
    },
    'bash': {
      oneOf: [
        {
          type: 'boolean'
        },
        {
          type: 'string'
        }
      ],
      description: `Serialize the command into a file and execute it with bash.`
    },
    'rootdir': {
      type: 'string',
      description: `Path to the mount point corresponding to the root directory, required
if the "arch_chroot" option is activated.`
    },
    'command': {
      oneOf: [
        {
          type: 'string'
        },
        {
          typeof: 'function'
        }
      ],
      description: `String, Object or array; Command to execute. A value provided as a
function is interpreted as an action and will be called by forwarding
the config object. The result is the expected to be the command
to execute.`
    },
    'cwd': {
      type: 'string',
      description: `Current working directory from where to execute the command.`
    },
    'code': {
      type: 'array',
      default: [0],
      items: {
        type: 'integer'
      },
      description: `Expected code(s) returned by the command, int or array of int, default
to 0.`
    }
  },
  required: ['command'],
  additionalProperties: false
};

ref = ['code_skipped', 'dry', 'env', 'format', 'gid', 'stdin_log', 'stdout', 'stdout_return', 'stdout_log', 'stderr', 'stderr_return', 'stderr_log', 'sudo', 'target', 'trap', 'uid'];
for (i = 0, len = ref.length; i < len; i++) {
  property = ref[i];
  (schema.properties[`${property}`] = {
    $ref: `module://@nikitajs/engine/lib/actions/execute#/properties/${property}`
  });
}

// ## Handler
handler = async function({
    config,
    tools: {find}
  }) {
  var bin, err, k, option, opts, ref1, v, value;
  // Global config
  config.docker = (await find(function({
      config: {docker}
    }) {
    return docker;
  }));
  ref1 = config.docker;
  for (k in ref1) {
    v = ref1[k];
    if (config[k] == null) {
      config[k] = v;
    }
  }
  opts = (function() {
    var j, len1, ref2, results;
    ref2 = utils[!config.compose ? 'options' : 'compose_options'];
    results = [];
    for (j = 0, len1 = ref2.length; j < len1; j++) {
      option = ref2[j];
      value = config[option];
      if (value == null) {
        continue;
      }
      if (value === true) {
        value = 'true';
      }
      if (value === false) {
        value = 'false';
      }
      if (option === 'tlsverify') {
        results.push(`--${option}`);
      } else {
        results.push(`--${option}=${value}`);
      }
    }
    return results;
  })();
  opts = opts.join(' ');
  bin = config.compose ? 'bin_compose' : 'bin_docker';
  try {
    return (await this.execute(config, {
      command: `export SHELL=/bin/bash
export PATH=/opt/local/bin/:/opt/local/sbin/:/usr/local/bin/:/usr/local/sbin/:$PATH
bin_boot2docker=$(command -v boot2docker)
bin_docker=$(command -v docker)
bin_machine=$(command -v docker-machine)
bin_compose=$(command -v docker-compose)
machine='${config.machine || ''}'
boot2docker='${config.boot2docker ? '1' : ''}'
docker=''
if [[ $machine != '' ]] && [ $bin_machine ]; then
  if [ -z "${config.machine || ''}" ]; then exit 5; fi
  if docker-machine status "\${machine}" | egrep 'Stopped|Saved'; then
    docker-machine start "\${machine}";
  fi
  eval "$(\${bin_machine} env \${machine})"
elif [[ $boot2docker != '1' ]] && [  $bin_boot2docker ]; then
  eval "$(\${bin_boot2docker} shellinit)"
fi
$${bin} ${opts} ${config.command}`
    }));
  } catch (error) {
    err = error;
    if (utils.string.lines(err.stderr.trim()).length === 1) {
      throw Error(err.stderr.trim());
    }
    if (/^Error response from daemon/.test(err.stderr)) {
      throw Error(err.stderr.trim().replace('Error response from daemon: ', ''));
    }
  }
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: require('@nikitajs/engine/lib/actions/execute').hooks.on_action
  },
  metadata: {
    schema: schema
  }
};

// ## Dependencies
utils = require('../utils');
