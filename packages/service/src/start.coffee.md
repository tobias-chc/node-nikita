
# `nikita.service.start`

Start a service.
Note, does not throw an error if service is not installed.

## Output

* `$status`   
  Indicates if the service was started ("true") or if it was already running 
  ("false").

## Example

```js
const {$status} = await nikita.service.start([{
  name: 'gmetad'
})
console.info(`Service was started: ${$status}`)
```

## Schema definitions

    definitions =
      config:
        type: 'object'
        properties:
          'name':
            $ref: 'module://@nikitajs/service/src/install#/definitions/config/properties/name'
        required: ['name']

## Handler

    handler = ({config, tools: {log}}) ->
      try
        {$status} = await @execute
          command: """
          ls \
            /lib/systemd/system/*.service \
            /etc/systemd/system/*.service \
            /etc/rc.d/* \
            /etc/init.d/* \
            2>/dev/null \
          | grep -w "#{config.name}" || exit 3
          if command -v systemctl >/dev/null 2>&1; then
            systemctl status #{config.name} && exit 3
            systemctl start #{config.name}
          elif command -v service >/dev/null 2>&1; then
            service #{config.name} status && exit 3
            service #{config.name} start
          else
            echo "Unsupported Loader" >&2
            exit 2
          fi
          """
          code: [0, 3]
          # arch_chroot: config.arch_chroot
          # rootdir: config.rootdir
        log message: "Service is started", level: 'INFO' if $status
        log message: "Service already started", level: 'WARN' if not $status
      catch err
        throw Error "Unsupported Loader" if err.exit_code is 2

## Exports

    module.exports =
      handler: handler
      metadata:
        argument_to_config: 'name'
        definitions: definitions
