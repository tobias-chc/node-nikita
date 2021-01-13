
nikita = require '@nikitajs/engine/lib'
{tags, ssh} = require '../test'
they = require('ssh2-they').configure ssh

return unless tags.lxd

describe 'lxd.network.delete', ->

  they 'Delete a network', ({ssh}) ->
    nikita
      ssh: ssh
    , ->
      @lxd.network
        network: "testnet0"
      {status} = await @lxd.network.delete
        network: "testnet0"
      status.should.be.true()
          
  they 'Network already deleted', ({ssh}) ->
    nikita
      ssh: ssh
    , ->
      @lxd.network
        network: "testnet0"
      @lxd.network.delete
        network: "testnet0"
      {status} = await @lxd.network.delete
        network: "testnet0"
      status.should.be.false()
