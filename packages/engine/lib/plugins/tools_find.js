// Generated by CoffeeScript 2.5.1
var find, utils, validate;

utils = require('../utils');

find = async function(action, finder) {
  var precious;
  precious = (await finder(action, finder));
  if (precious != null) {
    return precious;
  }
  if (!action.parent) {
    return void 0;
  }
  return find(action.parent, finder);
};

validate = function(action, args) {
  var finder;
  if (args.length === 1) {
    [finder] = args;
  } else if (args.length === 2) {
    [action, finder] = args;
  } else {
    if (!action) {
      throw utils.error('TOOLS_FIND_INVALID_ARGUMENT', ['action signature is expected to be', '`finder` or `action, finder`', `got ${JSON.stringify(args)}`]);
    }
  }
  if (!action) {
    throw utils.error('TOOLS_FIND_ACTION_FINDER_REQUIRED', ['argument `action` is missing and must be a valid action']);
  }
  if (!finder) {
    throw utils.error('TOOLS_FIND_FINDER_REQUIRED', ['argument `finder` is missing and must be a function']);
  }
  if (typeof finder !== 'function') {
    throw utils.error('TOOLS_FIND_FINDER_INVALID', ['argument `finder` is missing and must be a function']);
  }
  return [action, finder];
};

module.exports = {
  module: '@nikitajs/engine/lib/plugins/tools_find',
  hooks: {
    'nikita:session:normalize': function(action, handler) {
      return async function() {
        // Handler execution
        action = (await handler.apply(null, arguments));
        // Register function
        if (action.tools == null) {
          action.tools = {};
        }
        action.tools.find = async function() {
          var finder;
          [action, finder] = validate(action, arguments);
          return (await find(action, finder));
        };
        // Register action
        action.registry.register(['tools', 'find'], {
          metadata: {
            raw: true
          },
          handler: async function(action) {
            var finder;
            [action, finder] = validate(action, action.args);
            return (await find(action.parent, finder));
          }
        });
        return action;
      };
    }
  }
};
