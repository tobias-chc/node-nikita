# Be aware to specify the machine if docker mahcine is used
# Some other docker test uses docker_run
# as a conseauence docker_run should not docker an other command from docker family
# For this purpos ip, and clean are used

should = require 'should'
mecano = require '../../src'
test = require '../test'
they = require 'ssh2-they'
docker = require '../../src/misc/docker'

ip = (ssh, machine, callback) ->
  mecano
  .execute
    cmd: """
    export SHELL=/bin/bash
    export PATH=/opt/local/bin/:/opt/local/sbin/:/usr/local/bin/:/usr/local/sbin/:$PATH
    bin_boot2docker=$(command -v boot2docker)
    bin_machine=$(command -v docker-machine)
    if [ $bin_machine ];
      then
        if [ \"#{machine}\" = \"--\" ];then exit 5;fi
        eval $(${bin_machine} env #{machine}) && $bin_machine  ip #{machine}
    elif [ $bin_boot2docker ];
      then
        eval $(${bin_boot2docker} shellinit) && $bin_boot2docker ip
    else
      echo '127.0.0.1'
    fi
    """
    , (err, executed, stdout, stderr) ->
      return callback err if err
      ipadress = stdout.trim()
      return callback null, ipadress

describe 'docker run', ->

  config = test.config()
  return if config.docker.disable
  scratch = test.scratch @
  
  before (next) ->
    mecano
    .execute
      cmd: """
      if ! docker-machine status #{config.docker.machine} | grep Running ; then
        docker-machine start #{config.docker.machine}
      fi
      """
      if: config.docker.machine
    .then next

  they 'simple command', (ssh, next) ->
    mecano
      ssh: ssh
      machine: config.docker.machine
    .docker_run
      cmd: "/bin/echo 'test'"
      image: 'alpine'
      machine: config.docker.machine
    , (err, executed, stdout, stderr) ->
      stdout.should.match /^test.*/ unless err
    .then next
  
  they '--rm (flag option)', (ssh, next) ->
    mecano
      ssh: ssh
      machine: config.docker.machine
    .docker_rm
      force: true
      container: 'mecano_test_rm'
    .docker_run
      cmd: "/bin/echo 'test'"
      image: 'alpine'
      name: 'mecano_test_rm'
      rm: false
      , (err, executed, stdout, stderr) ->
        return err if err
        stdout.should.match /^test.*/ unless err
        mecano
          ssh: ssh
        .docker_rm
          machine: config.docker.machine
          force: true
          container: 'mecano_test_rm'
        .then next

  they 'unique option from array option', (ssh, next) ->
    ip ssh, config.docker.machine, (err, ipadress) =>
      return next err if  err
      @timeout 60000
      mecano
        ssh: ssh
        machine: config.docker.machine
      .docker_rm
        container: 'mecano_test_unique'
        force: true
      .docker_run
        image: 'httpd'
        port: '499:80'
        machine: config.docker.machine
        name: 'mecano_test_unique'
        detach: true
        rm: false
      .wait_connect
        port: 499
        host: ipadress
      .docker_rm
        force: true
        container: 'mecano_test_unique'
      .then next

  they 'array options', (ssh, next) ->
    ip ssh, config.docker.machine, (err, ipadress) =>
      return next err if  err
      @timeout 60000
      mecano
        ssh: ssh
        machine: config.docker.machine
      .docker_rm
        force: true
        container: 'mecano_test_array'
      .docker_run
        image: 'httpd'
        port: [ '500:80', '501:81' ]
        name: 'mecano_test_array'
        detach: true
        rm: false
      .wait_connect
        host: ipadress
        port: 500
      .docker_rm
        force: true
        container: 'mecano_test_array'
      .then next

  they 'existing container', (ssh, next) ->
    mecano
      ssh: ssh
      machine: config.docker.machine
    .docker_rm
      force: true
      container: 'mecano_test'
    .docker_run
      cmd: 'echo test'
      image: 'alpine'
      name: 'mecano_test'
      rm: false
    , (err, runned) ->
      runned.should.be.true()
    .docker_run
      cmd: "echo test"
      image: 'alpine'
      name: 'mecano_test'
      rm: false
    , (err, runned) ->
      runned.should.be.false()
    .docker_rm
      machine: config.docker.machine
      force: true
      container: 'mecano_test'
    .then next

  they 'status not modified', (ssh, next) ->
    @timeout 30000
    mecano
      ssh: ssh
      machine: config.docker.machine
    .docker_rm
      force: true
      container: 'mecano_test'
    .docker_run
      cmd: 'echo test'
      image: 'alpine'
      name: 'mecano_test'
      machine: config.docker.machine
      rm: false
    .docker_run
      cmd: 'echo test'
      image: 'alpine'
      name: 'mecano_test'
      machine: config.docker.machine
      rm: false
    , (err, executed, out, serr) ->
      executed.should.be.false()
      mecano
        ssh: ssh
        machine: config.docker.machine
      .docker_rm
        force: true
        container: 'mecano_test'
      .then next
