// Generated by CoffeeScript 2.7.0
  // # `nikita.tools.apm.uninstall`

// Remove one or more apm packages.

// ## Schema definitions
var definitions, handler,
  indexOf = [].indexOf;

definitions = {
  config: {
    type: 'object',
    properties: {
      'name': {
        type: 'array',
        items: {
          type: 'string'
        },
        description: `Name of the package(s) to install.`
      }
    }
  }
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var installed, pkgs, stdout, uninstall;
  config.name = config.name.map(function(pkg) {
    return pkg.toLowerCase();
  });
  installed = [];
  ({stdout} = (await this.execute({
    $shy: true,
    command: "apm list --installed --json"
  })));
  pkgs = JSON.parse(stdout);
  installed = pkgs.user.map(function(pkg) {
    return pkg.name.toLowerCase();
  });
  // Uninstall
  uninstall = config.name.filter(function(pkg) {
    return indexOf.call(installed, pkg) >= 0;
  });
  if (uninstall.length) {
    await this.execute({
      command: `apm uninstall ${config.name.join(' ')}`
    });
    return log({
      message: `APM Uninstalled Packages: ${config.name.join(', ')}`
    });
  }
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    argument_to_config: 'name',
    definitions: definitions
  }
};
