// Generated by CoffeeScript 2.7.0
var uuid;

({
  v4: uuid
} = require('uuid'));

module.exports = {
  name: '@nikitajs/core/lib/plugins/metadata/uuid',
  hooks: {
    'nikita:action': {
      handler: function(action) {
        if (action.metadata.depth === 0) {
          return action.metadata.uuid = uuid();
        } else {
          return action.metadata.uuid = action.parent.metadata.uuid;
        }
      }
    }
  }
};
