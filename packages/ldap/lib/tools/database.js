// Generated by CoffeeScript 2.7.0
// # `nikita.ldap.tools.database`

// Return the database associated with a suffix.

// ## Example

// ```js
// const {databases} = await nikita.ldap.tools.databases({
//   uri: 'ldap://localhost',
//   binddn: 'cn=admin,cn=config',
//   passwd: 'config'
// })
// // Value is similar to `[ '{-1}frontend', '{0}config', '{1}mdb' ]`
// databases.map( database => {
//   console.info(`Database: ${database}`)
// })
// ```

// ## Schema definitions
var definitions, handler, utils;

definitions = {
  config: {
    type: 'object',
    allOf: [
      {
        properties: {
          'base': {
            const: 'cn=config',
            default: 'cn=config'
          },
          'suffix': {
            type: 'string',
            description: `The suffix associated with the database.`
          }
        },
        required: ['suffix']
      },
      {
        $ref: 'module://@nikitajs/ldap/lib/search'
      }
    ]
  }
};

// ## Handler
handler = async function({config}) {
  var _, database, dn, stdout;
  ({stdout} = (await this.ldap.search(config, {
    base: config.base,
    filter: `(olcSuffix= ${config.suffix})`,
    attributes: ['dn']
  })));
  [_, dn] = stdout.split(':');
  dn = dn.trim();
  [_, database] = /^olcDatabase=(.*),/.exec(dn);
  return {
    dn: dn,
    database: database
  };
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    global: 'ldap',
    definitions: definitions
  }
};

// ## Dependencies
utils = require('../utils');
