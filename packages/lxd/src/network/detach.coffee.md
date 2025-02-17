
# `nikita.lxc.network.detach`

Detach a network from a container.

## Output

* `$status`
  True if the network was detached

## Example

```js
const {$status} = await nikita.lxc.network.detach({
  network: 'network0',
  container: 'container1'
})
console.info(`Network was detached: ${$status}`)
```

## Schema definitions

    definitions =
      config:
        type: 'object'
        properties:
          'network':
            type: 'string'
            description: '''
            The network name to detach.
            '''
          'container':
            $ref: 'module://@nikitajs/lxd/src/init#/definitions/config/properties/container'
        required: ['network', 'container']

## Handler

    handler = ({config}) ->
      #Execute
      await @execute
        command: """
        lxc config device list #{config.container} | grep #{config.network} || exit 42
        #{[
          'lxc'
          'network'
          'detach'
           config.network
           config.container
        ].join ' '}
        """
        code: [0, 42]

## Exports

    module.exports =
      handler: handler
      metadata:
        definitions: definitions
