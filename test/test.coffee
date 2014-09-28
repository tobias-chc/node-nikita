
lib = if process.env.MECANO_COV then 'lib-cov' else 'lib'
mecano = require "../#{lib}"
fs = require 'fs'

scratch = "/tmp/mecano-test"

module.exports = 
  scratch: (context) ->
    context.beforeEach (next) ->
      mecano.remove scratch, ->
        mecano.mkdir scratch, next
    scratch
  config: ->
    try
      config = require '../test.coffee'
    catch err
      throw err unless err.code is 'MODULE_NOT_FOUND'
      fs.renameSync "#{__dirname}/../test.coffee.sample", "#{__dirname}/../test.coffee"
      config = require '../test.coffee'
    if config.yum_over_ssh
      config.yum_over_ssh.username.should.eql 'root' # sudo not yet supported
    config