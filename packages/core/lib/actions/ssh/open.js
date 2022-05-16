// Generated by CoffeeScript 2.7.0
// # `nikita.ssh.open`

// Initialize an SSH connection.

// ## Examples

// Once an SSH connection is establish, it is possible to retrieve the connection
// by calling the `ssh` action. If no ssh connection is available, it will
// simply return null.

// ```js
// nikita
// .ssh.open({
//   host: 'localhost',
//   user: 'my_account',
//   password: 'my_secret'
// })
// .call(function(){
//   assert(!!@ssh(), true)
// })
// .execute({
//   metadata: {
//     header: 'Print remote hostname'
//   },
//   command: 'hostname'
// })
// .ssh.close()
// ```

// Set the `ssh` option to `null` or `false` to disabled SSH and force an action to be executed 
// locally:

// ```js
// nikita
// .ssh.open({
//   host: 'localhost',
//   user: 'my_account',
//   password: 'my_secret'
// })
// .call({ssh: false}, function(){
//   assert(@ssh(config.ssh), null)
// })
// .execute({
//   ssh: false,
//   metadata: {
//     header: 'Print local hostname'
//   },
//   command: 'hostname'
// })
// .ssh.close()
// ```

// It is possible to group all the config properties inside the `ssh` property. This is
// provided for conveniency and is often used to pass `ssh` information when
// initializing the session.

// ```js
// require('nikita')({
//   ssh: {
//     host: 'localhost',
//     user: 'my_account',
//     password: 'my_secret'
//   }
// })
// .ssh.open()
// .call(function({config}){
//   assert(!!@ssh(), true)
// })
// .ssh.close()
// ```

// ## Hooks
var connect, definitions, fs, handler, on_action, utils;

on_action = function({config}) {
  var base, base1;
  if (config.private_key == null) {
    config.private_key = config.privateKey;
  }
  // Define host from ip
  if (config.ip && !config.host) {
    config.host = config.ip;
  }
  // Default root properties
  if (config.root == null) {
    config.root = {};
  }
  if (config.root.ip && !config.root.host) {
    config.root.host = config.root.ip;
  }
  if ((base = config.root).host == null) {
    base.host = config.host;
  }
  return (base1 = config.root).port != null ? base1.port : base1.port = config.port;
};

// ## Schema definitions

// Configuration propeties are transfered as is to the ssh2 module to create a new SSH connection.
// Only will they be converted from snake case to came case. It is also possible to
// pass all the properties through the `ssh` property.
definitions = {
  config: {
    type: 'object',
    properties: {
      'host': {
        type: 'string',
        anyOf: [
          {
            format: 'ipv4'
          },
          {
            format: 'hostname'
          }
        ],
        default: '127.0.0.1',
        description: `Hostname or IP address of the remote server.`
      },
      'ip': {
        type: 'string',
        description: `IP address of the remote server, used if \`host\` isn't already defined.`
      },
      'password': {
        type: 'string',
        description: `Password of the user used to authenticate and create the SSH
connection.`
      },
      'port': {
        type: 'integer',
        default: 22,
        description: `Port of the remote server.`
      },
      'private_key': {
        type: 'string',
        description: `Content of the private key used to authenticate the user and create
the SSH connection. It is only used if \`password\` is not provided.`
      },
      'private_key_path': {
        type: 'string',
        default: '~/.ssh/id_rsa',
        description: `Local file location of the private key used to authenticate the user
and create the SSH connection. It is only used if \`password\` and
\`private_key\` are not provided.`
      },
      'root': {
        $ref: 'module://@nikitajs/core/lib/actions/ssh/root',
        description: `Configuration passed to \`nikita.ssh.root\` to enable password-less root
login.`
      },
      'username': {
        type: 'string',
        default: 'root',
        description: `Username of the user used to authenticate and create the SSH
connection.`
      }
    }
  }
};

// ## Handler
handler = async function({
    config,
    parent: {state},
    tools: {log}
  }) {
  var conn, err, location;
  if (!(config.private_key || config.password || config.private_key_path)) {
    // Validate authentication
    throw utils.error('NIKITA_SSH_OPEN_NO_AUTH_METHOD_FOUND', ['unable to authenticate the SSH connection,', 'one of the "private_key", "password", "private_key_path"', 'configuration properties must be provided']);
  }
  // Read private key if option is a path
  if (!(config.private_key || config.password)) {
    log({
      message: `Read Private Key from: ${config.private_key_path}`,
      level: 'DEBUG'
    });
    location = (await utils.tilde.normalize(config.private_key_path));
    try {
      ({
        data: config.private_key
      } = (await fs.readFile(location, 'ascii')));
    } catch (error) {
      err = error;
      if (err.code === 'ENOENT') {
        throw Error(`Private key doesnt exists: ${JSON.stringify(location)}`);
      }
      throw err;
    }
  }
  try {
    // Establish connection
    log({
      message: `Read Private Key: ${JSON.stringify(config.private_key_path)}`,
      level: 'DEBUG'
    });
    conn = (await connect(config));
    // state['nikita:ssh:connection'] = conn
    log({
      message: "Connection is established",
      level: 'INFO'
    });
    return {
      ssh: conn
    };
  } catch (error) {
    err = error;
    log({
      message: "Connection failed",
      level: 'WARN'
    });
  }
  // Enable root access
  if (config.root.username) {
    log({
      message: "Bootstrap Root Access",
      level: 'INFO'
    });
    await this.ssh.root(config.root);
  }
  log({
    message: "Establish Connection: attempt after enabling root access",
    level: 'DEBUG'
  });
  return (await this.call({
    $retry: 3
  }, async function() {
    conn = (await connect(config));
    return {
      // state['nikita:ssh:connection'] = conn
      ssh: conn
    };
  }));
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    definitions: definitions
  }
};

// ## Dependencies
connect = require('ssh2-connect');

fs = require('fs').promises;

utils = require('../../utils');
