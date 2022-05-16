// Generated by CoffeeScript 2.7.0
// # `nikita.system.user.read`

// Read and parse the passwd definition file located in "/etc/passwd".

// ## Output parameters

// * `users`   
//   An object where keys are the usernames and values are the user properties.
//   See the parameter `user` for a list of available properties.
// * `user`
//   Properties associated witht the user, only if the input parameter `uid` is
//   provided. Available properties are:   
//   * `user` (string)   
//   Username.
//   * `uid` (integer)   
//   User Id.
//   * `comment` (string)   
//   User description
//   * `home` (string)   
//   User home directory.
//   * `shell` (string)   
//   Default user shell command.

// ## Example

// ```js
// const {$status, users} = await nikita
// .file({
//   target: "/tmp/etc/passwd",
//   content: "root:x:0:0:root:/root:/bin/bash"
// })
// .system.user.read({
//   target: "/tmp/etc/passwd"
// })
// assert.equal($status, false)
// assert.deepEqual(users, {
//   "root": { user: 'root', uid: 0, gid: 0, comment: 'root', home: '/root', shell: '/bin/bash' }
// })
// ```

// ## Implementation

// The default implementation use the `getent passwd` command. It is possible to
// read an alternative `/etc/passwd` file by setting the `target` option to the
// targeted file.

// ## Schema definitions
var definitions, handler, utils;

definitions = {
  config: {
    type: 'object',
    properties: {
      'target': {
        type: 'string',
        description: `Path to the passwd definition file, use the \`getent passwd\` command by
default which use to "/etc/passwd".`
      },
      'uid': {
        $ref: 'module://@nikitajs/core/lib/actions/fs/chown#/definitions/config/properties/uid',
        description: `Retrieve the information for a specific username or uid.`
      }
    }
  }
};

// ## Handler
handler = async function({config}) {
  var data, passwd, stdout, str2passwd, user;
  if (typeof config.uid === 'string' && /\d+/.test(config.uid)) {
    config.uid = parseInt(config.uid, 10);
  }
  // Parse the passwd output
  str2passwd = function(data) {
    var i, len, line, passwd, ref;
    passwd = {};
    ref = utils.string.lines(data);
    for (i = 0, len = ref.length; i < len; i++) {
      line = ref[i];
      line = /(.*)\:\w\:(.*)\:(.*)\:(.*)\:(.*)\:(.*)/.exec(line);
      if (!line) {
        continue;
      }
      passwd[line[1]] = {
        user: line[1],
        uid: parseInt(line[2]),
        gid: parseInt(line[3]),
        comment: line[4],
        home: line[5],
        shell: line[6]
      };
    }
    return passwd;
  };
  // Fetch the users information
  if (!config.target) {
    ({stdout} = (await this.execute({
      command: 'getent passwd'
    })));
    passwd = str2passwd(stdout);
  } else {
    ({data} = (await this.fs.base.readFile({
      target: config.target,
      encoding: 'ascii'
    })));
    passwd = str2passwd(data);
  }
  if (!config.uid) {
    return {
      // Return all the users
      users: passwd
    };
  }
  // Return a user by username
  if (typeof config.uid === 'string') {
    user = passwd[config.uid];
    if (!user) {
      throw Error(`Invalid Option: no uid matching ${JSON.stringify(config.uid)}`);
    }
    return {
      user: user
    };
  } else {
    // Return a user by uid
    user = Object.values(passwd).filter(function(user) {
      return user.uid === config.uid;
    })[0];
    if (!user) {
      throw Error(`Invalid Option: no uid matching ${JSON.stringify(config.uid)}`);
    }
    return {
      user: user
    };
  }
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    definitions: definitions,
    shy: true
  }
};

// ## Dependencies
utils = require('../utils');
