// Generated by CoffeeScript 2.7.0
// # `nikita.docker.volume_rm`

// Remove a volume.

// ## Output

// * `err`   
//   Error object if any.
// * `$status`   
//   True is volume was removed.

// ## Example

// ```js
// const {$status} = await nikita.docker.volume_rm({
//   name: 'my_volume'
// })
// console.info(`Volume was removed: ${$status}`)
// ```

// ## Schema definitions
var definitions, handler;

definitions = {
  config: {
    type: 'object',
    properties: {
      'docker': {
        $ref: 'module://@nikitajs/docker/lib/tools/execute#/definitions/docker'
      },
      'name': {
        type: 'string',
        description: `Specify volume name.`
      }
    }
  }
};

// ## Handler
handler = async function({config}) {
  if (!config.name) {
    // Validation
    throw Error("Missing required option name");
  }
  return (await this.docker.tools.execute({
    command: `volume rm ${config.name}`,
    code: [0, 1]
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
