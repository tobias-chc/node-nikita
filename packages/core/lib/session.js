// Generated by CoffeeScript 2.5.1
var contextualize, merge, normalize, plugandplay, registry, run, schedule, session, utils;

({merge} = require('mixme'));

registry = require('./registry');

schedule = require('./schedulers/native');

plugandplay = require('plug-and-play');

contextualize = require('./session/contextualize');

normalize = require('./session/normalize');

utils = require('./utils');

session = function(action = {}) {
  var base, base1, on_call, on_get, result, schedulers;
  if (action.metadata == null) {
    action.metadata = {};
  }
  if ((base = action.metadata).namespace == null) {
    base.namespace = [];
  }
  if (action.state == null) {
    action.state = {};
  }
  if ((base1 = action.state).namespace == null) {
    base1.namespace = [];
  }
  // Catch calls to new actions
  on_call = function(...args) {
    var namespace, prom;
    // Extract action namespace and reset the state
    namespace = action.state.namespace.slice();
    action.state.namespace = [];
    // Schedule the action and get the result as a promise
    prom = action.scheduler.push(async function() {
      var actions, child;
      // Validate the namespace
      child = (await action.registry.get(namespace));
      if (!child) {
        return Promise.reject(utils.error('ACTION_UNREGISTERED_NAMESPACE', ['no action is registered under this namespace,', `got ${JSON.stringify(namespace)}.`]));
      }
      actions = (await action.plugins.call({
        name: 'nikita:arguments',
        args: {
          args: args,
          child: child,
          parent: action,
          namespace: namespace
        },
        handler: function({args, parent, namespace}) {
          actions = contextualize([
            ...args,
            {
              metadata: {
                namespace: namespace
              }
            }
          ]);
          (Array.isArray(actions) ? actions : [actions]).map(function(action) {
            if (action.config == null) {
              action.config = {};
            }
            if (action.parent != null) {
              action.config.parent = action.parent;
            }
            return action.parent = parent;
          });
          return actions;
        }
      }));
      if (!Array.isArray(actions)) {
        return session(actions);
      } else {
        return schedule(actions.map(function(action) {
          return function() {
            return session(action);
          };
        }));
      }
    });
    return new Proxy(prom, {
      get: on_get
    });
  };
  // Building the namespace before calling an action
  on_get = function(target, name) {
    if ((target[name] != null) && !action.registry.registered(name)) {
      if (typeof target[name] === 'function') {
        return target[name].bind(target);
      } else {
        return target[name];
      }
    }
    if (action.state.namespace.length === 0) {
      switch (name) {
        case 'plugins':
          return action.plugins;
      }
    }
    action.state.namespace.push(name);
    return new Proxy(on_call, {
      get: on_get
    });
  };
  // Initialize the plugins manager
  action.plugins = plugandplay({
    plugins: action.plugins,
    chain: new Proxy(on_call, {
      get: on_get
    }),
    parent: action.parent ? action.parent.plugins : void 0
  });
  // Initialize the registry to manage action registration
  action.registry = registry.create({
    plugins: action.plugins,
    parent: action.parent ? action.parent.registry : registry,
    on_register: async function(name, act) {
      return (await action.plugins.call({
        name: 'nikita:register',
        args: {
          name: name,
          action: act
        }
      }));
    }
  });
  // Local scheduler to execute children and be notified on finish
  schedulers = {
    in: schedule(),
    out: schedule(null, {
      pause: true
    })
  };
  // Start with a paused scheduler to register actions out of the handler
  action.scheduler = schedulers.out;
  if (action.context) {
    // Expose the action context
    action.config.context = action.context;
  }
  action.context = new Proxy(on_call, {
    get: on_get
  });
  // Execute the action
  result = new Promise(async function(resolve, reject) {
    var action_from_registry, k, on_result, output, pump, ref, v;
    // Hook intented to modify the current action being created
    action = (await action.plugins.call({
      name: 'nikita:normalize',
      args: action,
      hooks: ((ref = action.hooks) != null ? ref.on_normalize : void 0) || action.on_normalize,
      handler: normalize
    }));
    // Load action from registry
    if (action.metadata.namespace) {
      action_from_registry = (await action.registry.get(action.metadata.namespace));
// Merge the registry action with the user action properties
      for (k in action_from_registry) {
        v = action_from_registry[k];
        action[k] = merge(action_from_registry[k], action[k]);
      }
    }
    // Switch the scheduler to register actions inside the handler
    action.scheduler = schedulers.in;
    // Hook attended to alter the execution of an action handler
    output = action.plugins.call({
      name: 'nikita:action',
      args: action,
      hooks: action.hooks.on_action,
      handler: function(action) {
        // Execution of an action handler
        return action.handler.call(action.context, action);
      }
    });
    // Ensure child actions are executed
    pump = function() {
      var child;
      while (child = schedulers.out.state.stack.shift()) {
        // Now that the handler has been executed,
        // import all the actions registered outside of it
        action.scheduler.state.stack.push(child);
      }
      return action.scheduler.pump();
    };
    output.then(pump, pump);
    // Make sure the promise is resolved after the scheduler and its children
    Promise.all([output, action.scheduler]).then(function(values) {
      return on_result(void 0, values.shift());
    }, function(err) {
      return on_result(err);
    });
    // Hook to catch error and format output once all children are executed
    return on_result = function(error, output) {
      return action.plugins.call({
        name: 'nikita:result',
        args: {
          action: action,
          error: error,
          output: output
        },
        hooks: action.hooks.on_result,
        handler: function({action, error, output}) {
          if (error) {
            throw error;
          } else {
            return output;
          }
        }
      }).then(resolve, reject);
    };
  });
  result.then(function(output) {
    if (action.parent !== void 0) {
      return;
    }
    return action.plugins.call({
      name: 'nikita:resolved',
      args: {
        action: action,
        output: output
      }
    });
  }, function(err) {
    if (action.parent !== void 0) {
      return;
    }
    return action.plugins.call({
      name: 'nikita:rejected',
      args: {
        action: action,
        error: err
      }
    });
  });
  // Returning a proxified promise:
  // - new actions can be registered to it as long as the promised has not fulfilled
  // - resolve when all registered actions are fulfilled
  // - resolved with the result of handler
  return new Proxy(result, {
    get: on_get
  });
};

module.exports = run = function(...args) {
  var actions;
  actions = contextualize(args);
  // Are we scheduling one or multiple actions
  if (Array.isArray(actions)) {
    return schedule(actions.map(function(action) {
      return function() {
        return session(action);
      };
    }));
  } else {
    return session(actions);
  }
};
