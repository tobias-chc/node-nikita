// Generated by CoffeeScript 2.7.0
// # `nikita.system.user.remove`

// Create or modify a Unix user.

// ## Callback parameters

// * `$status`   
//   Value is "true" if user was created or modified.

// ## Example

// ```js
// const {$status} = await nikita.system.user.remove({
//   name: 'a_user'
// })
// console.log(`User removed: ${$status}`)
// ```

// ## Schema definitions
var definitions, handler;

definitions = {
  config: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: `Name of the user to removed.`
      }
    },
    required: ['name']
  }
};

// ## Handler
handler = function({config}) {
  return this.execute({
    command: `userdel ${config.name}`,
    code: [0, 6]
  });
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    argument_to_config: 'name'
  },
  definitions: definitions
};
