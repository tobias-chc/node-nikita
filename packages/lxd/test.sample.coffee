
module.exports =
  tags:
    lxd: true
    lxd_vm: process.platform is 'linux' && !process.env.CI
    lxd_prlimit: !process.env.CI
  images:
    alpine: 'alpine/3.17'
  config: [
    label: 'local'
    # label: 'remote'
    # ssh:
    #   host: '127.0.0.1', username: process.env.USER,
    #   private_key_path: '~/.ssh/id_ed25519'
    # Exemple with vagrant:
    # ssh:
    #   host: '127.0.0.1', port: 2222, username: 'vagrant'
    #   private_key_path: "#{require('os').homedir()}/.vagrant.d/insecure_private_key"
  ]
