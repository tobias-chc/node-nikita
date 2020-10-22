// Generated by CoffeeScript 2.5.1
// # `nikita.lxd.exec`

// Push files into containers.

// ## Options

// * `container` (string, required)
//   The name of the container.
// * `cmd` (string, required)
//   The command to execute.

// ## Example

// ```
// require('nikita')
// .lxd.exec({
//   container: "my-container"
//   cmd: "whoami"
// }, function(err, {status, stdout, stderr}) {
//   console.info( err ? err.message : stdout)
// });

// ```

// ## Todo

// * Support `env` option

// ## Source Code
var validate_container_name;

module.exports = function({options}, callback) {
  this.log({
    message: "Entering lxd.exec",
    level: 'DEBUG',
    module: '@nikitajs/lxd/lib/exec'
  });
  if (!options.container) {
    // Validation
    throw Error("Invalid Option: container is required");
  }
  validate_container_name(options.container);
  return this.system.execute(options, {
    trap: false
  }, {
    cmd: [`cat <<'NIKITALXDEXEC' | lxc exec ${options.container} -- bash`, options.trap ? 'set -e' : void 0, options.cmd, 'NIKITALXDEXEC'].join('\n')
  }, callback);
};

// ## Dependencies
validate_container_name = require('./misc/validate_container_name');
