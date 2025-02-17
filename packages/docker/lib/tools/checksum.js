// Generated by CoffeeScript 2.7.0
// # `nikita.docker.tools.checksum`

// Return the checksum of image:tag, if it exists. Note, there is no corresponding
// native docker command.

// ## Output

// * `err`   
//   Error object if any.
// * `$status`   
//   True if command was executed.
// * `checksum`   
//   Image cheksum if it exist, undefined otherwise.

// ## Hooks
var definitions, handler, on_action;

on_action = function({config}) {
  if (config.repository) {
    throw Error('Configuration `repository` is deprecated, use `image` instead');
  }
};

// ## Schema definitions
definitions = {
  config: {
    type: 'object',
    properties: {
      'cwd': {
        type: 'string',
        description: `Change the build working directory.`
      },
      'docker': {
        $ref: 'module://@nikitajs/docker/lib/tools/execute#/definitions/docker'
      },
      'image': {
        type: 'string',
        description: `Name of the Docker image present in the registry.`
      },
      'tag': {
        type: 'string',
        default: 'latest',
        description: `Tag of the Docker image, default to latest.`
      }
    }
  }
};

// ## Handler
handler = async function({
    config,
    tools: {find, log}
  }) {
  var $status, checksum, k, ref, stdout, v;
  // Global config
  config.docker = (await find(function({
      config: {docker}
    }) {
    return docker;
  }));
  ref = config.docker;
  for (k in ref) {
    v = ref[k];
    if (config[k] == null) {
      config[k] = v;
    }
  }
  log({
    message: `Getting image checksum :${config.image}`,
    level: 'DEBUG'
  });
  // Run `docker images` with the following config:
  // - `--no-trunc`: display full checksum
  // - `--quiet`: discard headers
  ({$status, stdout} = (await this.docker.tools.execute({
    boot2docker: config.boot2docker,
    command: `images --no-trunc --quiet ${config.image}:${config.tag}`,
    compose: config.compose,
    machine: config.machine
  })));
  checksum = stdout === '' ? void 0 : stdout.toString().trim();
  if ($status) {
    log({
      message: `Image checksum for ${config.image}: ${checksum}`,
      level: 'INFO'
    });
  }
  return {
    $status: $status,
    checksum: checksum
  };
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    definitions: definitions
  }
};
