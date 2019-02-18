
nikita = require '@nikitajs/core'
{tags, ssh, scratch, krb5} = require './test'
they = require('ssh2-they').configure ssh...

return unless tags.krb5_addprinc

describe 'krb5.ticket', ->

  they 'create a new principal without a randkey', ({ssh}) ->
    nikita
      ssh: ssh
      kadmin_server: krb5.kadmin_server
      kadmin_principal: krb5.kadmin_principal
      kadmin_password: krb5.kadmin_password
    .krb5.delprinc
      principal: "nikita@#{krb5.realm}"
    .krb5.addprinc
      principal: "nikita@#{krb5.realm}"
      password: 'myprecious'
    .system.execute 'kdestroy'
    .krb5.ticket
      principal: "nikita@#{krb5.realm}"
      password: 'myprecious'
    , (err, {status}) ->
      status.should.be.true() unless err
    .krb5.ticket
      principal: "nikita@#{krb5.realm}"
      password: 'myprecious'
    , (err, {status}) ->
      status.should.be.false() unless err
    .system.execute
      cmd: 'klist -s'
    .promise()
