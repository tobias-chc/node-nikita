// Generated by CoffeeScript 2.6.1
var connect, merge, ssh, whoami;

({merge} = require('mixme'));

({whoami} = require('./os'));

connect = require('ssh2-connect');

module.exports = ssh = {
  compare: function(ssh1, ssh2) {
    var compare_config, config1, config2;
    // Between 2 configurations
    compare_config = function(config1, config2) {
      return config1 && config2 && config1.host === config2.host && (config1.port || 22) === (config2.port || 22) && config1.username === config2.username;
    };
    if (!ssh1 && !ssh2 && !!ssh1 === !!ssh2) { // 2 null
      return true;
    }
    config1 = ssh.is(ssh1) ? ssh1.config : merge(ssh1);
    config2 = ssh.is(ssh2) ? ssh2.config : merge(ssh2);
    if (config1.username == null) {
      config1.username = whoami();
    }
    if (config2.username == null) {
      config2.username = whoami();
    }
    return compare_config(config1, config2);
  },
  is: function(ssh) {
    return connect.is(ssh);
  }
};
