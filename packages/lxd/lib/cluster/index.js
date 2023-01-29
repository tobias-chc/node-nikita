// Generated by CoffeeScript 2.7.0
// # `nikita.lxc.cluster`

// Create a cluster of LXD instances.

// ## Example

// ```yaml
// networks:
//   lxdbr0public:
//     ipv4.address: 172.16.0.1/24
//     ipv4.nat: true
//     ipv6.address: none
//   lxdbr1private:
//     ipv4.address: 10.10.10.1/24
//     ipv4.nat: true
//     ipv6.address: none
//     dns.domain: nikita.local
// containers:
//   nikita:
//     image: images:centos/7
//     properties:
//       environment:
//         MY_VAR: 'my value'
//     disk:
//       nikitadir:
//         source: /nikita
//         path: /nikita
//     nic:
//       eth0:
//         container: eth0
//         nictype: bridged
//         parent: lxdbr0public
//       eth1:
//         container: eth1
//         nictype: bridged
//         parent: lxdbr1private
//         ipv4.address: '10.10.10.10'
//     proxy:
//       ssh:
//         listen: 'tcp:0.0.0.0:2200'
//         connect: 'tcp:127.0.0.1:22'
//     ssh:
//       enabled: true
//       #id_rsa: assets/id_rsa
//     user:
//       nikita:
//         sudo: true
//         authorized_keys: assets/id_rsa.pub
//     prevision: path/to/action
//     provision: path/to/action
//     provision_container: path/to/action
// ```

// ## Hooks
var definitions, handler, on_action, utils;

on_action = {
  before: ['@nikitajs/core/src/plugins/metadata/schema'],
  handler: function({config}) {
    var container, name, ref, results;
    ref = config.containers;
    results = [];
    for (name in ref) {
      container = ref[name];
      results.push(container.container = name);
    }
    return results;
  }
};

// ## Schema definitions
definitions = {
  config: {
    type: 'object',
    properties: {
      'containers': {
        type: 'object',
        description: `Initialize a Linux Container with given image name, container name and
config.`,
        patternProperties: {
          '(^[a-zA-Z][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9](?!\-)$)|(^[a-zA-Z]$)': {
            $ref: 'module://@nikitajs/lxd/lib/init#/definitions/config',
            type: 'object',
            properties: {
              'properties': {
                $ref: 'module://@nikitajs/lxd/lib/config/set#/definitions/config/properties/properties'
              },
              'disk': {
                type: 'object',
                default: {},
                patternProperties: {
                  '.*': { // Device name of disk
                    $ref: 'module://@nikitajs/lxd/lib/config/device#/definitions/disk/properties/properties'
                  }
                }
              },
              'nic': {
                type: 'object',
                default: {},
                patternProperties: {
                  '.*': {
                    type: 'object',
                    allOf: [
                      {
                        properties: {
                          'ip': {
                            type: 'string',
                            format: 'ipv4'
                          },
                          'netmask': {
                            type: 'string',
                            default: '255.255.255.0',
                            format: 'ipv4'
                          }
                        }
                      },
                      {
                        $ref: 'module://@nikitajs/lxd/lib/config/device#/definitions/nic/properties/properties'
                      }
                    ]
                  }
                }
              },
              'proxy': {
                type: 'object',
                default: {},
                patternProperties: {
                  '.*': {
                    $ref: 'module://@nikitajs/lxd/lib/config/device#/definitions/proxy/properties/properties'
                  }
                }
              },
              'user': {
                type: 'object',
                default: {},
                patternProperties: {
                  '.*': {
                    type: 'object',
                    properties: {
                      'sudo': {
                        type: 'boolean',
                        default: false,
                        description: `Enable sudo access for the user.`
                      },
                      'authorized_keys': {
                        type: 'string',
                        description: `Path to file with SSH public key to be added to
authorized_keys file.`
                      }
                    }
                  }
                }
              },
              'ssh': {
                type: 'object',
                default: {},
                properties: {
                  'enabled': {
                    type: 'boolean',
                    default: false,
                    description: `Enable SSH connection.`
                  }
                }
              }
            }
          }
        }
      },
      'networks': {
        type: 'object',
        default: {},
        patternProperties: {
          '.*': {
            $ref: 'module://@nikitajs/lxd/lib/network#/definitions/config/properties/properties'
          }
        }
      },
      'prevision': {
        typeof: 'function',
        description: `A nikita action called before the container's creation.`
      },
      'prevision_container': {
        typeof: 'function',
        description: `A nikita action called for every container before it is created.`
      },
      'provision': {
        typeof: 'function',
        description: `A nikita action called after the container's creation.`
      },
      'provision_container': {
        typeof: 'function',
        description: `A nikita action called for every container after it is created.`
      }
    }
  }
};

// required: ['containers']

// ## Handler
handler = async function({config}) {
  var containerConfig, containerName, networkName, networkProperties, ref, ref1, ref2, ref3;
  if (!!config.prevision) {
    await this.call(config, config.prevision);
  }
  ref = config.networks;
  // Create a network
  for (networkName in ref) {
    networkProperties = ref[networkName];
    await this.lxc.network({
      $header: `Network ${networkName}`,
      network: networkName,
      properties: networkProperties
    });
  }
  if (!!config.prevision_container) {
    ref1 = config.containers;
    for (containerName in ref1) {
      containerConfig = ref1[containerName];
      await this.call({
        container: containerName
      }, containerConfig, config.prevision_container);
    }
  }
  ref2 = config.containers;
  // Init containers
  for (containerName in ref2) {
    containerConfig = ref2[containerName];
    await this.call({
      $header: `Container ${containerName}`
    }, async function() {
      var configDisk, configNic, configProxy, configUser, deviceName, ref3, ref4, ref5, ref6, ref7, results, userName;
      // Set configuration
      await this.lxc.init({
        $header: 'Init'
      }, containerConfig);
      // Set config
      if (containerConfig != null ? containerConfig.properties : void 0) {
        await this.lxc.config.set({
          $header: 'Properties',
          container: containerName,
          properties: containerConfig.properties
        });
      }
      ref3 = containerConfig.disk;
      // Create disk device
      for (deviceName in ref3) {
        configDisk = ref3[deviceName];
        await this.lxc.config.device({
          $header: `Device ${deviceName} disk`,
          container: containerName,
          device: deviceName,
          type: 'disk',
          properties: configDisk
        });
      }
      ref4 = containerConfig.nic;
      // Create nic device
      for (deviceName in ref4) {
        configNic = ref4[deviceName];
        // note: `confignic.config.parent` is not required for each type
        // throw Error "Required Property: nic.#{device}.parent" unless confignic.config.parent
        await this.lxc.config.device({
          $header: `Device ${deviceName} nic`,
          container: containerName,
          device: deviceName,
          type: 'nic',
          properties: utils.object.filter(configNic, ['ip', 'netmask'])
        });
      }
      ref5 = containerConfig.proxy;
      // Create proxy device
      for (deviceName in ref5) {
        configProxy = ref5[deviceName];
        // todo: add host detection and port forwarding to VirtualBox
        // VBoxManage controlvm 'lxd' natpf1 'ipa_ui,tcp,0.0.0.0,2443,,2443'
        await this.lxc.config.device({
          $header: `Device ${deviceName} proxy`,
          container: containerName,
          device: deviceName,
          type: 'proxy',
          properties: configProxy
        });
      }
      // Start container
      await this.lxc.start({
        $header: 'Start',
        container: containerName
      });
      
      // Wait until container is ready
      await this.lxc.wait.ready({
        $header: 'Wait for container to be ready to use',
        container: containerName,
        nat: !process.env.CI
      });
      // Openssl is required by the `lxc.file.push` action
      await this.lxc.exec({
        $header: 'OpenSSL',
        container: containerName,
        command: `command -v openssl && exit 42
if command -v yum >/dev/null 2>&1; then
  yum -y install openssl
elif command -v apt-get >/dev/null 2>&1; then
  apt-get -y install openssl
elif command -v apk >/dev/null 2>&1; then
  apk add openssl
else
  echo "Unsupported Package Manager" >&2 && exit 2
fi
command -v openssl`,
        trap: true,
        code: [0, 42]
      });
      // Enable SSH
      if ((ref6 = containerConfig.ssh) != null ? ref6.enabled : void 0) {
        await this.lxc.exec({
          $header: 'SSH',
          container: containerName,
          command: `if command -v systemctl >/dev/null 2>&1; then
  srv=\`systemctl list-units --all --type=service | grep ssh | sed 's/ *\\(ssh.*\\)\.service.*/\\1/'\`
  [ ! -z $srv ] && systemctl status $srv && exit 42 || echo '' > /dev/null
elif command -v rc-service >/dev/null 2>&1; then
  # Exit code 3 if stopped
  rc-service sshd status && exit 42 || echo '' > /dev/null
fi
if command -v yum >/dev/null 2>&1; then
  yum -y install openssh-server
elif command -v apt-get >/dev/null 2>&1; then
  apt-get -y install openssh-server
elif command -v apk >/dev/null 2>&1; then
  apk add openssh-server
else
  echo "Unsupported package manager" >&2 && exit 2
fi
if command -v systemctl >/dev/null 2>&1; then
  # Support \`ssh\` and \`sshd\`: changed between 16.04 and 22.04
  # systemctl list-units not showing sshd on centos 7 if module not started, fixing with --all
  srv=\`systemctl list-units --all --type=service | grep ssh | sed 's/ *\\(ssh.*\\)\.service.*/\\1/'\`
  systemctl start $srv
  systemctl enable $srv
elif command -v rc-update >/dev/null 2>&1; then
  rc-service sshd start
  rc-update add sshd
else
  echo "Unsupported init system" >&2 && exit 3
fi`,
          trap: true,
          code: [0, 42]
        });
      }
      ref7 = containerConfig.user;
      // Create users
      results = [];
      for (userName in ref7) {
        configUser = ref7[userName];
        results.push((await this.call({
          $header: `User ${userName}`
        }, async function() {
          await this.lxc.exec({
            $header: 'Create',
            container: containerName,
            command: `id ${userName} && exit 42
useradd --create-home --system ${userName}
mkdir -p /home/${userName}/.ssh
chown ${userName}.${userName} /home/${userName}/.ssh
chmod 700 /home/${userName}/.ssh`,
            trap: true,
            code: [0, 42]
          });
          // Enable sudo access
          await this.lxc.exec({
            $if: configUser.sudo,
            $header: 'Sudo',
            container: containerName,
            command: `yum install -y sudo
command -v sudo
cat /etc/sudoers | grep "${userName}" && exit 42
echo "${userName} ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers`,
            trap: true,
            code: [0, 42]
          });
          // Add SSH public key to authorized_keys file
          return (await this.lxc.file.push({
            $if: configUser.authorized_keys,
            $header: 'Authorize',
            container: containerName,
            gid: `${userName}`,
            uid: `${userName}`,
            mode: 600,
            source: `${configUser.authorized_keys}`,
            target: `/home/${userName}/.ssh/authorized_keys`
          }));
        })));
      }
      return results;
    });
  }
  if (!!config.provision_container) {
    ref3 = config.containers;
    for (containerName in ref3) {
      containerConfig = ref3[containerName];
      await this.call({
        container: containerName
      }, containerConfig, config.provision_container);
    }
  }
  if (!!config.provision) {
    return (await this.call(config, config.provision));
  }
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    definitions: definitions
  }
};

// ## Dependencies
utils = require('../utils');
