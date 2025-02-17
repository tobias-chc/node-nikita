// Generated by CoffeeScript 2.7.0
// Registration of `nikita.log` actions
var registry;

registry = require('@nikitajs/core/lib/registry');

module.exports = {
  log: {
    cli: '@nikitajs/log/lib/cli',
    csv: '@nikitajs/log/lib/csv',
    fs: '@nikitajs/log/lib/fs',
    md: '@nikitajs/log/lib/md',
    stream: '@nikitajs/log/lib/stream'
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
