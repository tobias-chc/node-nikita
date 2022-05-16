// Generated by CoffeeScript 2.7.0
// # `nikita.docker.login`

// Register or log in to a Docker registry server.

// ## Output

// * `err`   
//   Error object if any.   
// * `$status`   
//   True when the command was executed successfully.
// * `stdout`   
//   Stdout value(s) unless `stdout` option is provided.
// * `stderr`   
//   Stderr value(s) unless `stderr` option is provided.

// ## Schema definitions
var definitions, handler, utils;

definitions = {
  config: {
    type: 'object',
    properties: {
      'docker': {
        $ref: 'module://@nikitajs/docker/lib/tools/execute#/definitions/docker'
      },
      'email': {
        type: 'string',
        description: `User email.`
      },
      'password': {
        type: 'string',
        description: `User password.`
      },
      'user': {
        type: 'string',
        description: `Username of the user.`
      }
    }
  }
};

// ## Handler
handler = async function({config}) {
  return (await this.docker.tools.execute({
    command: [
      'login',
      ...(['email',
      'user',
      'password'].filter(function(opt) {
        return config[opt] != null;
      }).map(function(opt) {
        return `-${opt.charAt(0)} ${config[opt]}`;
      })),
      config.registry != null ? `${utils.string.escapeshellarg(config.registry)}` : void 0
    ].join(' ')
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

// ## Dependencies
utils = require('./utils');
