// Generated by CoffeeScript 2.5.1
// # `nikita.system.group`

// Create or modify a Unix group.

// ## Callback Parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   Value is "true" if group was created or modified.   

// ## Example

// ```js
// require('nikita')
// .system.group({
//   name: 'myself'
//   system: true
//   gid: 490
// }, function(err, status){
//   console.log(err ? err.message : 'Group was created/modified: ' + status);
// });
// ```

// The result of the above action can be viewed with the command
// `cat /etc/group | grep myself` producing an output similar to
// "myself:x:490:".

// ## Hooks
var handler, on_action, schema;

on_action = function({config}) {
  if (typeof config.gid === 'string') {
    return config.gid = parseInt(config.gid, 10);
  }
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'gid': {
      type: 'integer',
      description: `Group name or number of the user´s initial login group.`
    },
    'name': {
      type: 'string',
      description: `Login name of the group.`
    },
    'system': {
      type: 'boolean',
      default: false,
      description: `Create a system account, such user are not created with ahome by
default, set the "home" option if we it to be created.`
    }
  },
  required: ['name']
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var changes, groups, info, status;
  if (config.system == null) {
    config.system = false;
  }
  if (config.gid == null) {
    config.gid = null;
  }
  // throw Error 'Invalid gid option' if config.gid? and isNaN config.gid
  ({groups} = (await this.system.group.read()));
  info = groups[config.name];
  log(info ? {
    message: `Got group information for ${JSON.stringify(config.name)}`,
    level: 'DEBUG',
    module: 'nikita/lib/system/group'
  } : {
    message: `Group ${JSON.stringify(config.name)} not present`,
    level: 'DEBUG',
    module: 'nikita/lib/system/group'
  });
  if (!info) { // Create group
    ({status} = (await this.execute({
      command: ['groupadd', config.system ? '-r' : void 0, config.gid != null ? `-g ${config.gid}` : void 0, config.name].join(' '),
      code_skipped: 9
    })));
    if (!status) { // Modify group
      return log({
        message: "Group defined elsewhere than '/etc/group', exit code is 9",
        level: 'WARN',
        module: 'nikita/lib/system/group'
      });
    }
  } else {
    changes = ['gid'].filter(function(k) {
      return (config[k] != null) && `${info[k]}` !== `${config[k]}`;
    });
    if (changes.length) {
      await this.execute({
        command: ['groupmod', config.gid ? ` -g ${config.gid}` : void 0, config.name].join(' ')
      });
      return log({
        message: "Group information modified",
        level: 'WARN',
        module: 'nikita/lib/system/group'
      });
    } else {
      return log({
        message: "Group information unchanged",
        level: 'INFO',
        module: 'nikita/lib/system/group'
      });
    }
  }
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    argument_to_config: 'name',
    schema: schema
  }
};
