
path = require 'path'
runner = require '@nikitajs/lxd-runner'

runner
  cwd: '/nikita/packages/tools'
  container: 'nikita-tools-rubygems'
  logdir: path.resolve __dirname, './logs'
  cluster:
    containers:
      'nikita-tools-rubygems':
        image: 'images:centos/7'
        properties:
          'environment.NIKITA_TEST_MODULE': '/nikita/packages/tools/env/rubygems/test.coffee'
          'raw.idmap': if process.env['NIKITA_LXD_IN_VAGRANT']
          then 'both 1000 0'
          else "both #{process.getuid()} 0"
        disk:
          nikitadir:
            path: '/nikita'
            source: process.env['NIKITA_HOME'] or path.join(__dirname, '../../../../')
        ssh: enabled: true
    provision_container: ({config}) ->
      await @lxc.exec
        $header: 'Node.js'
        container: config.container
        command: '''
        if command -v node ; then exit 42; fi
        curl -sS -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
        . ~/.bashrc
        nvm install 16
        '''
        trap: true
        code: [0, 42]
      await @lxc.exec
        $header: 'SSH keys'
        container: config.container
        command: """
        mkdir -p /root/.ssh && chmod 700 /root/.ssh
        if [ ! -f /root/.ssh/id_rsa ]; then
          ssh-keygen -t rsa -f /root/.ssh/id_rsa -N ''
          cat /root/.ssh/id_rsa.pub > /root/.ssh/authorized_keys
        fi
        """
        trap: true
      await @lxc.exec
        $header: 'Ruby'
        container: config.container
        command: """
        yum install -y gcc ruby ruby-devel
        """
        trap: true
        code: [0, 42]
.catch (err) ->
  console.error err
