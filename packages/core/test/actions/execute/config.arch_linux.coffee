
nikita = require '../../../src'
utils = require '../../../src/utils'
{tags, config} = require '../../test'
they = require('mocha-they')(config)

return unless tags.system_execute_arc_chroot

describe 'actions.execute.config.arch_linux', ->
  
  describe 'schema', ->
    
    it 'arch_chroot require arch_chroot_rootdir', ->
      nikita.execute
        config:
          arch_chroot: true
          command: ''
        handler: (->)
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'one error was found in the configuration of action `execute`:'
          '#/dependencies/arch_chroot/required config should have required property \'arch_chroot_rootdir\'.'
        ].join ' '
  
  describe 'usage', ->

    they 'target as string', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        @execute
          command: "mount --bind /var/tmp/root.x86_64 /mnt"
        @fs.base.writeFile
          target: '/mnt/root/hello'
          content: "you"
        try
          {stdout} = await @execute
            arch_chroot: true
            arch_chroot_rootdir: '/mnt'
            # target is written to "/tmp" by default which is a mount point
            # so a file in host isnt visible from jail
            target: '/root/my_script'
            command: "cat /root/hello"
          stdout.should.eql 'you'
        catch err
          throw err
        finally
          @execute
            command: """
            umount /mnt
            """
    
