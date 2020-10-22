// Generated by CoffeeScript 2.5.1
var EventEmitter, merge, path, stackTrace;

({EventEmitter} = require('events'));

stackTrace = require('stack-trace');

path = require('path');

({merge} = require('mixme'));

/*
The `log` plugin inject a log fonction into the action.handler argument.

It is possible to pass the `metadata.log` property. When `false`, logging is
disabled. When a function, the function is called with normalized logs every
time the `log` function is called with the `log`, `config` and `metadata` argument.

*/
module.exports = function() {
  return {
    module: '@nikitajs/engine/src/plugins/log',
    require: '@nikitajs/engine/src/plugins/tools_events',
    hooks: {
      'nikita:session:normalize': function(action) {
        var ref, ref1;
        // Move property from action to metadata
        if (action.hasOwnProperty('log')) {
          action.metadata.log = action.log;
          delete action.log;
        }
        if ((action.metadata.log == null) && (((ref = action.parent) != null ? (ref1 = ref.metadata) != null ? ref1.log : void 0 : void 0) != null)) {
          return action.metadata.log = action.parent.metadata.log;
        }
      },
      'nikita:session:action': {
        after: '@nikitajs/engine/src/plugins/tools_events',
        handler: function(action) {
          if (action.tools == null) {
            action.tools = {};
          }
          return action.tools.log = function(log) {
            var frame, ref, ref1;
            log = merge(log);
            if (typeof log === 'string') {
              log = {
                message: log
              };
            }
            if (log.level == null) {
              log.level = 'INFO';
            }
            if (log.time == null) {
              log.time = Date.now();
            }
            if (log.index == null) {
              log.index = action.metadata.index;
            }
            if (log.module == null) {
              log.module = action.metadata.module;
            }
            if (log.namespace == null) {
              log.namespace = action.metadata.namespace;
            }
            if (log.type == null) {
              log.type = 'text';
            }
            log.depth = action.metadata.depth;
            log.metadata = action.metadata;
            log.config = action.config;
            frame = stackTrace.get()[1];
            log.filename = frame.getFileName();
            log.file = path.basename(frame.getFileName());
            log.line = frame.getLineNumber();
            if (typeof action.metadata.log === 'function') {
              if ((ref = action.metadata) != null) {
                ref.log({
                  log: log,
                  config: action.config,
                  metadata: action.metadata
                });
              }
            } else {
              if (((ref1 = action.metadata) != null ? ref1.log : void 0) === false) {
                return;
              }
            }
            action.tools.events.emit(log.type, log, action);
            return log;
          };
        }
      }
    }
  };
};
