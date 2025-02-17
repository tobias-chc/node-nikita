// Generated by CoffeeScript 2.7.0
// # `nikita.tools.npm.upgrade`

// Upgrade all Node.js packages with NPM.

// ## Example

// The following action upgrades all global packages.

// ```js
// const {$status} = await nikita.tools.npm.upgrade({
//   global: true
// })
// console.info(`Packages were upgraded: ${$status}`)
// ```

// ## Schema definitions
var definitions, handler;

definitions = {
  config: {
    type: 'object',
    properties: {
      'cwd': {
        $ref: 'module://@nikitajs/core/lib/actions/execute#/definitions/config/properties/cwd'
      },
      'global': {
        type: 'boolean',
        default: false,
        description: `Upgrades global packages.`
      },
      'name': {
        type: 'array',
        items: {
          type: 'string'
        },
        description: `Name of the package(s) to upgrade.`
      }
    },
    if: {
      properties: {
        'global': {
          const: false
        }
      }
    },
    then: {
      required: ['cwd']
    }
  }
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var info, name, names, outdated, packages;
  // Get outdated packages
  ({packages} = (await this.tools.npm.outdated({
    cwd: config.cwd,
    global: config.global
  })));
  outdated = (function() {
    var results;
    results = [];
    for (name in packages) {
      info = packages[name];
      if (info.current === info.wanted) {
        continue;
      }
      results.push(name);
    }
    return results;
  })();
  if (config.name) {
    names = config.name.map(function(name) {
      return name.split('@')[0];
    });
    outdated = outdated.filter(function(name) {
      return names.includes(name);
    });
  }
  // No package to upgrade
  if (!outdated.length) {
    return;
  }
  // Upgrade outdated packages
  await this.execute({
    command: ['npm', 'update', config.global ? '--global' : void 0].join(' '),
    cwd: config.cwd
  });
  return log({
    message: `NPM upgraded packages: ${outdated.join(', ')}`
  });
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    definitions: definitions
  }
};

// ## Note

// From the NPM documentation:

// > https://docs.npmjs.com/cli/v6/commands/npm-update#updating-globally-installed-packages
// Globally installed packages are treated as if they are installed
// with a caret semver range specified.

// However, we didn't saw this with npm@7.5.3:

// ```
// npm install -g csv-parse@3.0.0
// npm update -g
// npm ls -g csv-parse # print 4.15.1
// ```
