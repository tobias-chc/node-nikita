
# `nikita.service.status`

Status of a service.
Note, does not throw an error if service is not installed.

## Output

* `$status`   
  Indicates if the startup behavior has changed.   

## Example

```js
const {$status} = await nikita.service.status([{
  name: 'gmetad'
})
console.info(`Service status: ${$status}`)
```

## Notes

Historically, we had the following two config:

* `code_started` (int|string|array)   
Expected code(s) returned by the command for STARTED status, int or array of
int, default to 0.   
* `code_stopped` (int|string|array)   
Expected code(s) returned by the command for STOPPED status, int or array of 
int, default to 3.

We might think about re-integrating them.

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
      log message: "Status for service #{config.name}", level: 'INFO'
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
              systemctl status #{config.name} || exit 3
            elif command -v service >/dev/null 2>&1; then
              service #{config.name} status || exit 3
            else
              echo "Unsupported Loader" >&2
              exit 2
            fi
            """
          code: [0, 3]
          # arch_chroot: config.arch_chroot
          # arch_chroot_rootdir: config.arch_chroot_rootdir
        log message: "Status for #{config.name} is #{if $status then 'started' else 'stoped'}", level: 'INFO'
      catch err
        throw Error "Unsupported Loader" if err.exit_code is 2

## Exports

    module.exports =
      handler: handler
      metadata:
        argument_to_config: 'name'
        definitions: definitions
