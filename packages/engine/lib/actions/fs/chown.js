// Generated by CoffeeScript 2.5.1
// # `nikita.fs.chown`

// Change the ownership of a file or a directory.

// ## Callback Parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   Value is "true" if file ownership was created or modified.   

// ## Example

// ```js
// require('nikita').fs.chown({
//   target: '~/my/project',
//   uid: 'my_user'
//   gid: 'my_group'
// }, function(err, modified){
//   console.log(err ? err.message : 'File was modified: ' + modified);
// });
// ```

// ## Note

// To list all files owner by a user or a uid, run:

// ```bash
// find /var/tmp -user `whoami`
// find /var/tmp -uid 1000
// find / -uid $old_uid -print | xargs chown $new_uid:$new_gid
// ```

// ## Hook
var handler, on_action, schema;

on_action = function({config, metadata}) {
  if (metadata.argument != null) {
    config.target = metadata.argument;
  }
  if ((typeof config.uid === 'string') && /\d+/.test(config.uid)) {
    // String to integer coercion
    config.uid = parseInt(config.uid);
  }
  if ((typeof config.gid === 'string') && /\d+/.test(config.gid)) {
    return config.gid = parseInt(config.gid);
  }
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'gid': {
      type: 'integer',
      // oneOf: [{type: 'integer'}, {type: 'string'}]
      description: `Unix group name or id who owns the target file.`
    },
    'stats': {
      typeof: 'object',
      description: `Stat object of the target file. Short-circuit to avoid fetching the
stat object associated with the target if one is already available.`
    },
    'target': {
      type: 'string',
      description: `Location of the file which permissions will change.`
    },
    'uid': {
      type: 'integer',
      // oneOf: [{type: 'integer'}, {type: 'string'}]
      description: `Unix user name or id who owns the target file.`
    }
  },
  required: ['target']
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var changes, err, gid, stats, stdout, uid;
  if (!((config.uid != null) || (config.gid != null))) {
    throw Error("Missing one of uid or gid option");
  }
  if (config.uid != null) {
    uid = typeof config.uid === 'number' ? config.uid : (({stdout} = (await this.execute(`id -u '${config.uid}'`))), parseInt(stdout.trim()));
  }
  if (config.gid != null) {
    gid = typeof config.gid === 'number' ? config.gid : (({stdout} = (await this.execute(`id -g '${config.gid}'`))), parseInt(stdout.trim()));
  }
  // Retrieve target stats
  if (config.stats) {
    log({
      message: "Stat short-circuit",
      level: 'DEBUG'
    });
    stats = config.stats;
  } else {
    ({stats} = (await this.fs.base.stat(config.target)));
  }
  // Detect changes
  changes = {
    uid: (uid != null) && stats.uid !== uid,
    gid: (gid != null) && stats.gid !== gid
  };
  if (!changes.uid && !changes.gid) {
    log({
      message: `Matching ownerships on '${config.target}'`,
      level: 'INFO',
      module: 'nikita/lib/chown'
    });
    return false;
  }
  try {
    // Apply changes
    await this.fs.base.chown({
      target: config.target,
      uid: uid,
      gid: gid
    });
  } catch (error) {
    err = error;
    console.log(err);
  }
  if (changes.uid) {
    log({
      message: `change uid from ${stats.uid} to ${uid}`,
      level: 'WARN',
      module: 'nikita/lib/chown'
    });
  }
  if (changes.gid) {
    log({
      message: `change gid from ${stats.gid} to ${gid}`,
      level: 'WARN',
      module: 'nikita/lib/chown'
    });
  }
  return true;
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  schema: schema
};
