// Generated by CoffeeScript 2.7.0
// # `nikita.lxc.storage.delete`

// Delete an existing lxd storage.

// ## Output

// * `$status`
//   True if the object was deleted

// ## Example

// ```js
// const {$status} = await nikita.lxc.storage.delete({
//   name: 'system'
// })
// console.info(`Storage was deleted: ${$status}`)
// ```

// ## Schema definitions
var definitions, handler;

definitions = {
  config: {
    type: 'object',
    properties: {
      'name': {
        type: 'string',
        description: `The storage name to delete.`
      }
    },
    required: ['name']
  }
};

// ## Handler
handler = async function({config}) {
  var command_delete;
  command_delete = ['lxc', 'storage', 'delete', config.name].join(' ');
  //Execute
  return (await this.execute({
    command: `lxc storage list | grep ${config.name} || exit 42
${command_delete}`,
    code: [0, 42]
  }));
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    argument_to_config: 'name',
    definitions: definitions
  }
};
