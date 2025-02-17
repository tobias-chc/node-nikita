
nikita = require '@nikitajs/core/lib'
{tags, config, service} = require './test'
they = require('mocha-they')(config)

return unless tags.service_install

describe 'service.install', ->
  
  @timeout 50000

  they 'new package', ({ssh, sudo}) ->
    nikita
      $ssh: ssh
      $sudo: sudo
    , ->
      @service.remove
        name: service.name
      {$status} = await @service
        name: service.name
      $status.should.be.true()
  
  they 'already installed packages', ({ssh, sudo}) ->
    nikita
      $ssh: ssh
      $sudo: sudo
    , ->
      @service.remove
        name: service.name
      @service
        name: service.name
      {$status} = await @service
        name: service.name
      $status.should.be.false()

  they 'name as default argument', ({ssh, sudo}) ->
    nikita
      $ssh: ssh
      $sudo: sudo
    , ->
      @service.remove
        name: service.name
      {$status} = await @service service.name
      $status.should.be.true()
  
  they 'cache', ({ssh}) ->
    nikita
      $ssh: ssh
    , ->
      @service.remove
        name: service.name
      @call ({parent: {state}}) ->
        (state['nikita:execute:installed'] is undefined).should.be.true()
      {$status} = await @service
        name: service.name
        cache: true
      $status.should.be.true()
      @call ({parent: {state}}) ->
        state['nikita:execute:installed'].should.containEql service.name

  they 'throw error if not exists', ({ssh, sudo}) ->
    nikita.service.install
      $ssh: ssh
      $sudo: sudo
      name: 'thisservicedoesnotexist'
    .should.be.rejectedWith
      code: 'NIKITA_SERVICE_INSTALL'
      message: [
        'NIKITA_SERVICE_INSTALL:'
        'failed to install package,'
        'name is `thisservicedoesnotexist`'
      ].join ' '

  they 'option `code`', ({ssh, sudo}) ->
    nikita
      $ssh: ssh
      $sudo: sudo
    , ->
      {$status} = await @service.install
        name: 'thisservicedoesnotexist'
        code: [0, [1, 100]] # 1 for RHEL, 100 for Ubuntu
      $status.should.be.false()

describe 'service.install arch', ->
  
  return unless tags.service_install_arch
  
  they 'add pacman options', ({ssh, sudo}) ->
    message = null
    nikita
      $ssh: ssh
      $sudo: sudo
    , ({tools: {events}}) ->
      events.on 'stdin', (log) -> message = log.message
      @service.remove
        name: service.name
      @service.install
        name: service.name
        pacman_flags: ['u', 'y']
      @call ->
        message.should.containEql "pacman --noconfirm -S #{service.name} -u -y"
      
  they 'add yaourt options', ({ssh, sudo}) ->
    message = null
    nikita
      $ssh: ssh
      $sudo: sudo
    , ({tools: {events}}) ->
      events.on 'stdin', (log) -> message = log.message
      @service.remove
        name: service.name
      @service.install
        name: service.name
        yaourt_flags: ['u', 'y']
      @call ->
        message.should.containEql "yaourt --noconfirm -S #{service.name} -u -y"
      
  they 'add yay options', ({ssh, sudo}) ->
    message = null
    nikita
      $ssh: ssh
      $sudo: sudo
    , ({tools: {events}}) ->
      events.on 'stdin', (log) -> message = log.message
      @service.remove
        name: service.name
      @service.install
        name: service.name
        yay_flags: ['u', 'y']
      @call ->
        message.should.containEql "yay --noconfirm -S #{service.name} -u -y"
