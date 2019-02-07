// Generated by CoffeeScript 2.3.2
// # `nikita.system.execute`

// Run a command locally or with ssh if `host` or `ssh` is provided.

// ## Exit codes

// The properties "code" and "code_skipped" are important to determine whether an
// action failed or succeed with or without modifications. An action is expected to
// execute successfully with modifications if the exit code match one of the value
// in "code", by default "0". Otherwise, it is considered to have failed and an
// error is passed to the user callback. The "code_skipped" option is used to
// define one or more exit codes that are considered successfull but without
// creating any modifications.

// ## Options

// * `arch_chroot` (boolean|string, optional)   
//   Run this command inside a root directory with the arc-chroot command or any
//   provided string, require the "rootdir" option if activated.
// * `bash` (boolean|string, optional)   
//   Serialize the command into a file and execute it with bash.
// * `rootdir` (string, optional)   
//   Path to the mount point corresponding to the root directory, required if
//   the "arch_chroot" option is activated.
// * `cmd` (string, required)   
//   String, Object or array; Command to execute.
// * `code` (int|string|array, optional, 0)   
//   Expected code(s) returned by the command, int or array of int, default to 0.
// * `code_skipped` (int|string|array, optional)   
//   Expected code(s) returned by the command if it has no effect, executed will
//   not be incremented, int or array of int.
// * `dirty` (boolean, optional, false)   
//   Leave temporary files on the filesystem.
// * `trap` (boolean, optional, false)   
//   Exit immediately if a commands exits with a non-zero status.
// * `cwd` (string, optional)   
//   Current working directory.
// * `env`   
//   Environment variables, default to `process.env`.
// * `gid`   
//   Unix group id.
// * `log`   
//   Function called with a log related messages.
// * `stdin_log` (boolean)   
//   Log the executed command of type stdin, default is "true".
// * `stdout` (stream.Writable)   
//   Writable EventEmitter in which the standard output of executed commands will
//   be piped.
// * `stdout_callback` (boolean, optional, true)   
//   Pass stdout output to the callback, default is "true".
// * `stdout_log` (boolean, optional, true)   
//   Pass stdout output to the logs of type "stdout_stream", default is "true".
// * `stdout_trim` (boolean, optional, false)   
//   Trim stdout argument passed in the callback.
// * `stderr` (stream.Writable)   
//   Writable EventEmitter in which the standard error output of executed command
//   will be piped.
// * `stderr_callback` (boolean, optional, true)   
//   Pass stderr output to the callback, default is "true".
// * `stderr_log` (boolean, optional, true)   
//   Pass stdout output to the logs of type "stdout_stream", default is "true".
// * `stderr_trim` (boolean, optional, false)   
//   Trim stderr argument passed in the callback.
// * `sudo` (boolean, optional, false)   
//   Run a command as sudo, desactivated if user is "root".
// * `target` (string, optional)   
//   Temporary path storing the script, only apply with the bash and arch_chroot options, always disposed once executed.
// * `uid`   
//   Unix user id.

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `info.status`   
//   Value is "true" if command exit equals option "code", "0" by default, "false" if
//   command exit equals option "code_skipped", none by default.
// * `info.stdout`   
//   Stdout value(s) unless `stdout` option is provided.
// * `info.stderr`   
//   Stderr value(s) unless `stderr` option is provided.

// ## Create a user over SSH

// This example create a user on a remote server with the `useradd` command. It
// print the error message if the command failed or an information message if it
// succeed.

// An exit code equal to "9" defined by the "code_skipped" option indicates that
// the command is considered successfull but without any impact.

// ```javascript
// nikita.system.execute({
//   ssh: ssh,
//   cmd: 'useradd myfriend',
//   code_skipped: 9
// }, function(err, {status}){
//   if(err) return;
//   console.info(status ? 'User created' : 'User already exists')
// });
// ```

// ## Run a command with bash

// ```javascript
// nikita.system.execute({
//   bash: true,
//   cmd: 'env'
// }, function(err, {stdout}){
//   console.info(err || stdout);
// });
// ```

// ## Source Code
var exec, misc, path, string;

module.exports = function({options}, callback) {
  var current_username, result, ssh;
  this.log({
    message: "Entering execute",
    level: 'DEBUG',
    module: 'nikita/lib/system/execute'
  });
  // SSH connection
  ssh = this.ssh(options.ssh);
  if (typeof options.argument === 'string') {
    // Validate parameters
    options.cmd = options.argument;
  }
  if (options.code == null) {
    options.code = [0];
  }
  if (!Array.isArray(options.code)) {
    options.code = [options.code];
  }
  if (options.code_skipped == null) {
    options.code_skipped = [];
  }
  if (!Array.isArray(options.code_skipped)) {
    options.code_skipped = [options.code_skipped];
  }
  if (options.stdin_log == null) {
    options.stdin_log = true;
  }
  if (options.stdout_log == null) {
    options.stdout_log = true;
  }
  if (options.stderr_log == null) {
    options.stderr_log = true;
  }
  if (options.stdout_callback === void 0) {
    options.stdout_callback = true;
  }
  if (options.stderr_callback === void 0) {
    options.stderr_callback = true;
  }
  if (typeof options.cmd === 'function') {
    options.cmd = options.cmd.call(this, arguments[0]);
  }
  if (options.bash === true) {
    options.bash = 'bash';
  }
  if (options.arch_chroot === true) {
    options.arch_chroot = 'arch-chroot';
  }
  if (options.cmd && options.trap) {
    options.cmd = `set -e\n${options.cmd}`;
  }
  options.cmd_original = `${options.cmd}`;
  if (options.dirty == null) {
    options.dirty = false;
  }
  if (options.cmd == null) {
    throw Error("Required Option: the \"cmd\" option is not provided");
  }
  if (['bash', 'arch_chroot'].filter(function(k) {
    return options[k];
  }).length > 1) {
    throw Error("Incompatible Options: bash, arch_chroot");
  }
  if (options.arch_chroot && !options.rootdir) {
    throw Error("Required Option: \"rootdir\" with \"arch_chroot\"");
  }
  if (options.target && !['bash', 'arch_chroot'].filter(function(k) {
    return options[k];
  }).length) {
    throw Error("Invalid Option: the \"target\" option requires either one of the \"bash\" or \"arch_chroot\" options");
  }
  result = {
    stdout: null,
    stderr: null,
    code: null
  };
  // Guess current username
  current_username = ssh ? ssh.config.username : /^win/.test(process.platform) ? process.env['USERPROFILE'].split(path.sep)[2] : process.env['USER'];
  // Sudo
  this.call(function() {
    if (!options.sudo) {
      return;
    }
    if (current_username === 'root') {
      return options.sudo = false;
    }
    if (!['bash', 'arch_chroot'].some(function(k) {
      return options[k];
    })) {
      return options.bash = 'bash';
    }
  });
  // User substitution
  // Determines if writing is required and eventually convert uid to username
  this.call({
    shy: true
  }, function(_, callback) {
    if (!options.uid) {
      return callback(null, false);
    }
    if (current_username === 'root') {
      return callback(null, false);
    }
    if (!/\d/.test(`${options.uid}`)) {
      return callback(null, options.uid !== current_username);
    }
    return this.system.execute({
      [`awk -v val=${options.uid} -F `]: " '$3==val{print $1}' /etc/passwd`"
    }, function(err, {stdout}) {
      if (!err) {
        options.uid = stdout.trim();
      }
      if (!(options.bash || options.arch_chroot)) {
        options.bash = 'bash';
      }
      return callback(err, options.uid !== current_username);
    });
  });
  // Write script
  this.call({
    if: function() {
      return options.bash;
    }
  }, function() {
    var cmd;
    cmd = options.cmd;
    if (typeof options.target !== 'string') {
      options.target = `/tmp/nikita_${string.hash(options.cmd)}`;
    }
    this.log({
      message: `Writing bash script to ${JSON.stringify(options.target)}`,
      level: 'INFO'
    });
    options.cmd = `${options.bash} ${options.target}`;
    if (options.uid) {
      options.cmd = `su - ${options.uid} -c '${options.cmd}'`;
    }
    if (!options.dirty && (options.target != null)) {
      options.cmd += `;code=\`echo $?\`; rm '${options.target}'; exit $code`;
    }
    return this.fs.writeFile({
      target: options.target,
      content: cmd,
      uid: options.uid,
      sudo: false
    });
  });
  this.call({
    if: function() {
      return options.arch_chroot;
    }
  }, function() {
    var cmd;
    cmd = options.cmd;
    if (typeof options.target !== 'string') {
      options.target = `/var/tmp/nikita_${string.hash(options.cmd)}`;
    }
    this.log({
      message: `Writing arch-chroot script to ${JSON.stringify(options.target)}`,
      level: 'INFO'
    });
    options.cmd = `arch-chroot ${options.rootdir} bash ${options.target}`;
    if (!options.dirty && (options.target != null)) {
      options.cmd += `;code=\`echo $?\`; rm '${path.join(options.rootdir, options.target)}'; exit $code`;
    }
    return this.fs.writeFile({
      target: `${path.join(options.rootdir, options.target)}`,
      content: `${cmd}`,
      mode: options.mode,
      sudo: false
    });
  });
  this.call(function() {
    if (!options.sudo) {
      return;
    }
    if (options.sudo) {
      return options.cmd = `sudo ${options.cmd}`;
    }
  });
  // Execute
  this.call(function({}, callback) {
    var child, stderr_stream_open, stdout_stream_open;
    if (options.stdin_log) {
      this.log({
        message: options.cmd_original,
        type: 'stdin',
        level: 'INFO',
        module: 'nikita/lib/system/execute'
      });
    }
    child = exec(options, {
      ssh: ssh
    });
    result.stdout = [];
    result.stderr = [];
    if (options.stdout) {
      child.stdout.pipe(options.stdout, {
        end: false
      });
    }
    if (options.stderr) {
      child.stderr.pipe(options.stderr, {
        end: false
      });
    }
    stdout_stream_open = stderr_stream_open = false;
    if (options.stdout_callback || options.stdout_log) {
      child.stdout.on('data', (data) => {
        if (options.stdout_log) {
          stdout_stream_open = true;
        }
        if (options.stdout_log) {
          this.log({
            message: data,
            type: 'stdout_stream',
            module: 'nikita/lib/system/execute'
          });
        }
        if (options.stdout_callback) {
          if (Array.isArray(result.stdout)) { // A string on exit
            return result.stdout.push(data);
          } else {
            return console.warn('stdout coming after child exit');
          }
        }
      });
    }
    if (options.stderr_callback || options.stderr_log) {
      child.stderr.on('data', (data) => {
        if (options.stderr_log) {
          stderr_stream_open = true;
        }
        if (options.stderr_log) {
          this.log({
            message: data,
            type: 'stderr_stream',
            module: 'nikita/lib/system/execute'
          });
        }
        if (options.stderr_callback) {
          if (Array.isArray(result.stderr)) { // A string on exit
            return result.stderr.push(data);
          } else {
            return console.warn('stderr coming after child exit');
          }
        }
      });
    }
    return child.on("exit", (code) => {
      result.code = code;
      // Give it some time because the "exit" event is sometimes
      // called before the "stdout" "data" event when runing
      // `npm test`
      return setTimeout(() => {
        var err, status;
        if (stdout_stream_open && options.stdout_log) {
          this.log({
            message: null,
            type: 'stdout_stream',
            module: 'nikita/lib/system/execute'
          });
        }
        if (stderr_stream_open && options.stderr_log) {
          this.log({
            message: null,
            type: 'stderr_stream',
            module: 'nikita/lib/system/execute'
          });
        }
        result.stdout = result.stdout.map(function(d) {
          return d.toString();
        }).join('');
        if (options.trim || options.stdout_trim) {
          result.stdout = result.stdout.trim();
        }
        result.stderr = result.stderr.map(function(d) {
          return d.toString();
        }).join('');
        if (options.trim || options.stderr_trim) {
          result.stderr = result.stderr.trim();
        }
        if (result.stdout && result.stdout !== '' && options.stdout_log) {
          this.log({
            message: result.stdout,
            type: 'stdout',
            module: 'nikita/lib/system/execute'
          });
        }
        if (result.stderr && result.stderr !== '' && options.stderr_log) {
          this.log({
            message: result.stderr,
            type: 'stderr',
            module: 'nikita/lib/system/execute'
          });
        }
        if (options.stdout) {
          child.stdout.unpipe(options.stdout);
        }
        if (options.stderr) {
          child.stderr.unpipe(options.stderr);
        }
        if (options.code.indexOf(code) === -1 && options.code_skipped.indexOf(code) === -1) {
          err = Error(`Invalid Exit Code: ${code}`);
          err.code = code;
          return callback(err, null);
        }
        if (options.code_skipped.indexOf(code) === -1) {
          status = true;
        } else {
          this.log({
            message: `Skip exit code "${code}"`,
            level: 'INFO',
            module: 'nikita/lib/system/execute'
          });
        }
        return callback(null, status);
      }, 1);
    });
  });
  return this.next(function(err, {status}) {
    return callback(err, {
      status: status,
      stdout: result.stdout,
      stderr: result.stderr,
      code: result.code
    });
  });
};

// ## Dependencies
path = require('path');

exec = require('ssh2-exec');

misc = require('../../misc');

string = require('../../misc/string');
