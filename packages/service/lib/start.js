// Generated by CoffeeScript 2.5.1
// # `nikita.service.start`

// Start a service.
// Note, does not throw an error if service is not installed.

// ## Output

// * `$status`   
//   Indicates if the service was started ("true") or if it was already running 
//   ("false").

// ## Example

// ```js
// const {$status} = await nikita.service.start([{
//   name: 'gmetad'
// })
// console.info(`Service was started: ${$status}`)
// ```

// ## Schema
var handler, schema;

schema = {
  config: {
    type: 'object',
    properties: {
      'name': {
        $ref: 'module://@nikitajs/service/lib/install#/definitions/config/properties/name'
      }
    },
    required: ['name']
  }
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var $status, err;
  try {
    ({$status} = (await this.execute({
      command: `ls /lib/systemd/system/*.service /etc/systemd/system/*.service /etc/rc.d/* /etc/init.d/* 2>/dev/null | grep -w "${config.name}" || exit 3
if command -v systemctl >/dev/null 2>&1; then
  systemctl status ${config.name} && exit 3
  systemctl start ${config.name}
elif command -v service >/dev/null 2>&1; then
  service ${config.name} status && exit 3
  service ${config.name} start
else
  echo "Unsupported Loader" >&2
  exit 2
fi`,
      code_skipped: 3
    })));
    if ($status) {
      // arch_chroot: config.arch_chroot
      // rootdir: config.rootdir
      log({
        message: "Service is started",
        level: 'INFO'
      });
    }
    if (!$status) {
      return log({
        message: "Service already started",
        level: 'WARN'
      });
    }
  } catch (error) {
    err = error;
    if (err.exit_code === 2) {
      throw Error("Unsupported Loader");
    }
  }
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    argument_to_config: 'name',
    schema: schema
  }
};
