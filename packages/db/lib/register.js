// Generated by CoffeeScript 2.7.0
// Registration of `nikita.db` actions
var registry;

registry = require('@nikitajs/core/lib/registry');

module.exports = {
  db: {
    database: {
      '': '@nikitajs/db/lib/database',
      exists: '@nikitajs/db/lib/database/exists',
      remove: '@nikitajs/db/lib/database/remove',
      wait: '@nikitajs/db/lib/database/wait'
    },
    query: '@nikitajs/db/lib/query',
    schema: {
      '': '@nikitajs/db/lib/schema',
      exists: '@nikitajs/db/lib/schema/exists',
      list: '@nikitajs/db/lib/schema/list',
      remove: '@nikitajs/db/lib/schema/remove'
    },
    user: {
      '': '@nikitajs/db/lib/user',
      exists: '@nikitajs/db/lib/user/exists',
      remove: '@nikitajs/db/lib/user/remove'
    }
  }
};

(async function() {
  var err;
  try {
    return (await registry.register(module.exports));
  } catch (error) {
    err = error;
    console.error(err.stack);
    return process.exit(1);
  }
})();
