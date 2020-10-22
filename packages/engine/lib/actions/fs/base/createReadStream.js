// Generated by CoffeeScript 2.5.1
// # `nikita.fs.createReadStream`

// ## Example

// ```js
// buffers = []
// await require('nikita')
// .fs.createReadStream({
//   target: '/path/to/file'
//   stream: function(rs){
//     stream.on('readable', function(){
//       while(buffer = rs.read()){
//         buffers.push(buffer);
//       }
//     })
//   }
// })
// console.info(Buffer.concat(buffers).toString())
// ```

// ```js
// buffers = []
// await require('nikita')
// .fs.createReadStream({
//   target: '/path/to/file'
//   on_readable: function(rs){
//     while(buffer = rs.read()){
//       buffers.push(buffer);
//     }
//   }
// })
// console.info(Buffer.concat(buffers).toString())
// ```

// ## Hook
var error, errors, fs, handler, on_action, os, schema, string;

on_action = function({config, metadata}) {
  if (metadata.argument != null) {
    return config.target = metadata.argument;
  }
};

// ## schema
schema = {
  type: 'object',
  properties: {
    'encoding': {
      type: 'string',
      enum: require('../../../utils/schema').encodings,
      default: 'utf8',
      description: `The encoding used to decode the buffer into a string. The encoding can
be any one of those accepted by Buffer. When not defined, this action
return a Buffer instance.`
    },
    'stream': {
      typeof: 'function',
      description: `User provided function receiving the newly created readable stream.
The user is responsible for pumping new content from it.`
    },
    'target': {
      oneOf: [
        {
          type: 'string'
        },
        {
          instanceof: 'Buffer'
        }
      ],
      description: `Source location of the file to read.`
    }
  },
  required: ['target']
};

// ## Source Code
handler = async function({
    config,
    hooks,
    metadata,
    tools: {path, log, find},
    ssh
  }) {
  var current_username, err, sudo;
  sudo = (await find(function({
      config: {sudo}
    }) {
    return sudo;
  }));
  // Normalization
  // throw Error "Required Option: the \"target\" option is mandatory" unless config.target
  config.target = config.cwd ? path.resolve(config.cwd, config.target) : path.normalize(config.target);
  if (ssh && !path.isAbsolute(config.target)) {
    throw Error(`Non Absolute Path: target is ${JSON.stringify(config.target)}, SSH requires absolute paths, you must provide an absolute path in the target or the cwd option`);
  }
  if (sudo) {
    if (config.target_tmp == null) {
      config.target_tmp = `${metadata.tmpdir}/${string.hash(config.target)}`;
    }
  }
  if (!(hooks.on_readable || config.stream)) {
    throw error.NIKITA_FS_CRS_NO_EVENT_HANDLER();
  }
  // Guess current username
  current_username = os.whoami({
    ssh: ssh
  });
  try {
    if (config.target_tmp) {
      await this.execute(`[ ! -f '${config.target}' ] && exit
cp '${config.target}' '${config.target_tmp}'
chown '${current_username}' '${config.target_tmp}'`);
      log({
        message: "Placing original file in temporary path before reading",
        level: 'INFO',
        module: 'nikita/lib/fs/createReadStream'
      });
    }
  } catch (error1) {
    err = error1;
    log({
      message: "Failed to place original file in temporary path",
      level: 'ERROR',
      module: 'nikita/lib/fs/createReadStream'
    });
    throw err;
  }
  // Read the stream
  log({
    message: `Reading file ${config.target_tmp || config.target}`,
    level: 'DEBUG',
    module: 'nikita/lib/fs/createReadStream'
  });
  return new Promise(async function(resolve, reject) {
    var buffers, rs;
    buffers = [];
    rs = (await fs.createReadStream(ssh, config.target_tmp || config.target));
    if (hooks.on_readable) {
      rs.on('readable', function() {
        return hooks.on_readable(rs);
      });
    } else {
      config.stream(rs);
    }
    rs.on('error', function(err) {
      if (err.code === 'ENOENT') {
        err = errors.NIKITA_FS_CRS_TARGET_ENOENT({
          config: config,
          err: err
        });
      } else if (err.code === 'EISDIR') {
        err = errors.NIKITA_FS_CRS_TARGET_EISDIR({
          config: config,
          err: err
        });
      } else if (err.code === 'EACCES') {
        err = errors.NIKITA_FS_CRS_TARGET_EACCES({
          config: config,
          err: err
        });
      }
      return reject(err);
    });
    return rs.on('end', resolve);
  });
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    log: false,
    raw_output: true,
    tmpdir: true
  },
  schema: schema
};

// ## Errors
errors = {
  NIKITA_FS_CRS_NO_EVENT_HANDLER: function() {
    return error('NIKITA_FS_CRS_NO_EVENT_HANDLER', ['unable to consume the readable stream,', 'one of the "on_readable" or "stream"', 'hooks must be provided']);
  },
  NIKITA_FS_CRS_TARGET_ENOENT: function({err, config}) {
    return error('NIKITA_FS_CRS_TARGET_ENOENT', ['fail to read a file because it does not exist,', !config.target_tmp ? `location is ${JSON.stringify(config.target)}.` : `location is ${JSON.stringify(config.target_tmp)} (temporary file, target is ${JSON.stringify(config.target)}).`], {
      errno: err.errno,
      syscall: err.syscall,
      path: err.path
    });
  },
  NIKITA_FS_CRS_TARGET_EISDIR: function({err, config}) {
    return error('NIKITA_FS_CRS_TARGET_EISDIR', ['fail to read a file because it is a directory,', !config.target_tmp ? `location is ${JSON.stringify(config.target)}.` : `location is ${JSON.stringify(config.target_tmp)} (temporary file, target is ${JSON.stringify(config.target)}).`], {
      errno: err.errno,
      syscall: err.syscall,
      path: config.target_tmp || config.target // Native Node.js api doesn't provide path
    });
  },
  NIKITA_FS_CRS_TARGET_EACCES: function({err, config}) {
    return error('NIKITA_FS_CRS_TARGET_EACCES', ['fail to read a file because permission was denied,', !config.target_tmp ? `location is ${JSON.stringify(config.target)}.` : `location is ${JSON.stringify(config.target_tmp)} (temporary file, target is ${JSON.stringify(config.target)}).`], {
      errno: err.errno,
      syscall: err.syscall,
      path: config.target_tmp || config.target // Native Node.js api doesn't provide path
    });
  }
};


// ## Dependencies
fs = require('ssh2-fs');

error = require('../../../utils/error');

os = require('../../../utils/os');

string = require('../../../utils/string');
