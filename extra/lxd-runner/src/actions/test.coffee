
module.exports = ({config})->
  # @lxc.exec
  #   container: "#{config.container}"
  #   cwd: "#{config.cwd}"
  #   command: 'npm run test:local'
  #   shell: 'bash -l'
  @execute
    stdout: process.stdout
    env: process.env
    command: [
      'lxc exec'
      "--cwd #{config.cwd}"
      # Note, core ssh env log in as "source" user
      "--user #{config.test_user}" if config.test_user
      "#{config.container} --"
      'bash -l -c "npm run test:local"'
    ].join ' '
