// Generated by CoffeeScript 2.7.0
// # `nikita.call`

// A generic action to call user defined action. It expects the action as a
// parameter. It can be the object representing the action or only the handler
// function. Alternatively, a string is interpreted as the path to module which
// is then required and executed.

// ## Passing an action

// ```js
// const {key} = await nikita.call({
//   config: {
//     key: 'value'
//   },
//   handler: ({config}) => config.key
// })
// assert(key === 'value')
// ```

// ## Passing a function

// ```js
// const key = await nikita.call( () => 'value' )
// assert(key === 'value')
// ```

// You can also provide the fuction among other arguments:

// ```js
// const key = await nikita.call( {
//   key: 'value'
// }, ({config}) => {
//   return config.key
// })
// assert(key === 'value')
// ```

// ## Using a module path

// ```js
// const value = await nikita(function(){
//   await this.fs.base.writeFile({
//     content: 'module.exports = ({config}) => "my secret"',
//     target: '/tmp/my_module'
//   })
//   return this.call( '/tmp/my_module' )
// })
// assert(value === 'value')
// ```

// ## Exports
var mutate, path;

module.exports = {
  hooks: {
    on_action: function(action) {
      var mod, on_action, ref;
      if (typeof action.metadata.argument !== 'string') {
        return;
      }
      mod = action.metadata.argument;
      if (typeof mod === 'string') {
        if (mod.substr(0, 1) === '.') {
          // When metadata.argument is a string,
          // `call` consider it to be the module name to load.
          mod = path.resolve(process.cwd(), mod);
        }
        mod = require.main.require(mod);
        // The loaded action can have its own interpretation of an argument.
        // In order to avoid any conflict, we simply remove the
        // `action.metadata.argument` property.
        // We shall probably also clean up the action.args array.
        action.metadata.module = action.metadata.argument;
        action.metadata.argument = void 0;
      }
      on_action = (ref = mod.hooks) != null ? ref.on_action : void 0;
      if (typeof mod === 'function') {
        mod = {
          handler: mod
        };
      }
      mutate(action, mod, {
        metadata: {
          module: action.metadata.argument
        }
      });
      if (on_action) {
        action = on_action.call(null, action);
      }
      return action;
    }
  }
};

// ## Dependencies
path = require('path');

({mutate} = require('mixme'));
