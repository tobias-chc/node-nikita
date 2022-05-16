// Generated by CoffeeScript 2.7.0
// Registration of `nikita.krb5` actions
var registry;

registry = require('@nikitajs/core/lib/registry');

module.exports = {
  krb5: {
    addprinc: '@nikitajs/krb5/lib/addprinc',
    delprinc: '@nikitajs/krb5/lib/delprinc',
    execute: '@nikitajs/krb5/lib/execute',
    ktadd: '@nikitajs/krb5/lib/ktadd',
    ticket: '@nikitajs/krb5/lib/ticket',
    ktutil: {
      add: '@nikitajs/krb5/lib/ktutil/add'
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
