// Generated by CoffeeScript 2.7.0
// # `nikita.system.tmpfs`

// Mount a directory with tmpfs.d as a [tmpfs](https://www.freedesktop.org/software/systemd/man/tmpfiles.d.html) configuration file.

// ## Callback parameters

// * `$status`   
//   Wheter the directory was mounted or already mounted.

// # Example

// All parameters can be omitted except type. nikita.tmpfs will ommit by replacing 
// the undefined value as '-', which does apply the os default behavior.

// Setting uid/gid to '-', make the os creating the target owned by root:root. 

// ## Schema definitions
var definitions, handler, merge, utils;

definitions = {
  config: {
    type: 'object',
    properties: {
      'age': {
        type: 'string',
        description: `Used to decide what files to delete when cleaning.`
      },
      'argument': {
        type: 'string',
        description: `The destination path of the symlink if type is \`L\`.`
      },
      'backup': {
        type: ['boolean', 'string'],
        default: true,
        description: `Create a backup, append a provided string to the filename extension or
a timestamp if value is not a string, only apply if the target file
exists and is modified.`
      },
      'gid': {
        $ref: 'module://@nikitajs/core/lib/actions/fs/chown#/definitions/config/properties/gid',
        description: `File group name or group id.`
      },
      'merge': {
        type: 'boolean',
        default: true,
        description: `Overrides properties if already exits.`
      },
      'mount': {
        type: 'string',
        description: `The mount point dir to create on system startup.`
      },
      'mode': {
        $ref: 'module://@nikitajs/core/lib/actions/fs/chmod#/definitions/config/properties/mode',
        description: `Mode of the target configuration file`
      },
      'name': {
        type: 'string',
        description: `The file name, can not be used with target. If only \`name\` is set, it
writes the content to default configuration directory and creates the
file  as '\`name\`.conf'.`
      },
      'perm': {
        type: 'string',
        default: '0644',
        description: `Mount path mode in string format like \`"0644"\`.`
      },
      'target': {
        type: 'string',
        description: `File path where to write content to. Defined to
/etc/tmpfiles.d/{config.uid}.conf if uid is defined or
/etc/tmpfiles.d/default.conf.`
      },
      'uid': {
        $ref: 'module://@nikitajs/core/lib/actions/fs/chown#/definitions/config/properties/uid',
        description: `File user name or user id.`
      }
    },
    required: ['mount']
  }
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var $status, content, data, err, i, key, len, ref, source;
  // for now only support directory type path option
  content = {};
  content[config.mount] = {};
  ref = ['mount', 'perm', 'uid', 'gid', 'age', 'argu'];
  for (i = 0, len = ref.length; i < len; i++) {
    key = ref[i];
    content[config.mount][key] = config[key];
  }
  content[config.mount]['type'] = 'd';
  if (config.uid != null) {
    if (!/^[0-9]+/.exec(config.uid)) {
      if (config.name == null) {
        config.name = config.uid;
      }
    }
  }
  if (config.target == null) {
    config.target = config.name != null ? `/etc/tmpfiles.d/${config.name}.conf` : '/etc/tmpfiles.d/default.conf';
  }
  log({
    message: `target set to ${config.target}`,
    level: 'DEBUG'
  });
  if (config.merge) {
    log({
      message: "opening target file for merge",
      level: 'DEBUG'
    });
    try {
      ({data} = (await this.fs.base.readFile({
        target: config.target,
        encoding: 'utf8'
      })));
      source = utils.tmpfs.parse(data);
      content = merge(source, content);
      log({
        message: "content has been merged",
        level: 'DEBUG'
      });
    } catch (error) {
      err = error;
      if (err.code !== 'NIKITA_FS_CRS_TARGET_ENOENT') {
        throw err;
      }
    }
  }
  // Seriazile and write the content
  content = utils.tmpfs.stringify(content);
  ({$status} = (await this.file({
    content: content,
    gid: config.gid,
    mode: config.mode,
    target: config.target,
    uid: config.uid
  })));
  if ($status) {
    log({
      message: `re-creating ${config.mount} tmpfs file`,
      level: 'INFO'
    });
    this.execute({
      command: `systemd-tmpfiles --remove ${config.target}`
    });
    return this.execute({
      command: `systemd-tmpfiles --create ${config.target}`
    });
  }
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    definitions: definitions
  }
};

// ## Dependencies
utils = require('./utils');

({merge} = require('mixme'));

// [conf-tmpfs]: https://www.freedesktop.org/software/systemd/man/tmpfiles.d.html
