// Generated by CoffeeScript 2.5.1
// # `nikita.docker.pull`

// Pull a container.

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   True if container was pulled.
// * `stdout`   
//   Stdout value(s) unless `stdout` option is provided.
// * `stderr`   
//   Stderr value(s) unless `stderr` option is provided.

// ## Example

// 1- builds an image from dockerfile without any resourcess

// ```javascript
// require('nikita')
// .docker.pull({
//   tag: 'postgresql'
// }, function(err, {status}){
//   console.info( err ? err.message : 'Container pulled: ' + status);
// })
// ```

// ## Schema
var handler, schema;

schema = {
  type: 'object',
  properties: {
    'tag': {
      type: 'string',
      description: `Name of the tag to pull.`
    },
    'version': {
      type: 'string',
      description: `Version of the tag to control. Default to \`latest\`.`
    },
    'all': {
      type: 'boolean',
      description: `Download all tagged images in the repository.  Default to false.`
    },
    'boot2docker': {
      $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/boot2docker'
    },
    'compose': {
      $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/compose'
    },
    'machine': {
      $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/machine'
    }
  }
};

// ## Handler
handler = async function({
    config,
    tools: {find, log}
  }) {
  var cmd, status, version;
  log({
    message: "Entering Docker pull",
    level: 'DEBUG',
    module: 'nikita/lib/docker/pull'
  });
  // Validate parameters
  version = config.version || config.tag.split(':')[1] || 'latest';
  delete config.version; // present in misc.docker.config, will probably disappear at some point
  if (config.all == null) {
    config.all = false;
  }
  if (config.tag == null) {
    throw Error('Missing Tag Name');
  }
  // rm is false by default only if config.service is true
  cmd = 'pull';
  cmd += config.all ? ` -a ${config.tag}` : ` ${config.tag}:${version}`;
  ({status} = (await this.docker.tools.execute({
    cmd: ['images', `| grep '${config.tag}'`, !config.all ? `| grep '${version}'` : void 0].join(' '),
    code_skipped: 1
  })));
  return this.docker.tools.execute({
    unless: status,
    cmd: cmd
  });
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    global: 'docker'
  },
  schema: schema
};
