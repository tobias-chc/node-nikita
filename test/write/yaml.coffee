
mecano = require '../../src'
misc = require '../../src/misc'
test = require '../test'
they = require 'ssh2-they'
fs = require 'ssh2-fs'

describe 'write_yaml', ->

  scratch = test.scratch @

  they 'stringify an object', (ssh, next) ->
    mecano.write_yaml
      ssh: ssh
      content: user: preference: color: 'rouge'
      target: "#{scratch}/user.yml"
    , (err, written) ->
      return next err if err
      written.should.be.true()
      fs.readFile ssh, "#{scratch}/user.yml", 'utf8', (err, data) ->
        return next err if err
        data.should.eql 'user:\n  preference:\n    color: rouge\n'
        next()


  they 'merge an object', (ssh, next) ->
    content = 'user:\n  preference:\n    language: english\n'
    fs.writeFile ssh, "#{scratch}/user.yml", content, (err) ->
      return next err if err
      mecano.write_yaml
        ssh: ssh
        content: user: preference: language: 'french'
        target: "#{scratch}/user.yml"
        merge: true
      , (err, written) ->
        return next err if err
        written.should.be.true()
        fs.readFile ssh, "#{scratch}/user.yml", 'utf8', (err, data) ->
          return next err if err
          data.should.eql 'user:\n  preference:\n    language: french\n'
          next()

  they 'discard undefined and null', (ssh, next) ->
    mecano.write_yaml
      ssh: ssh
      content: user: preference: color: 'violet', age: undefined, gender: null
      target: "#{scratch}/user.yml"
      merge: true
    , (err, written) ->
      return next err if err
      written.should.be.true()
      fs.readFile ssh, "#{scratch}/user.yml", 'utf8', (err, data) ->
        return next err if err
        data.should.eql 'user:\n  preference:\n    color: violet\n'
        next()

  they 'remove null within merge', (ssh, next) ->
    content = 'user:\n  preference:\n    language: lovelynode\n    color: rouge\n'
    fs.writeFile ssh, "#{scratch}/user.yml", content, (err) ->
      return next err if err
      mecano.write_yaml
        ssh: ssh
        content: user: preference:
          color: 'rouge'
          language: null
        target: "#{scratch}/user.yml"
        merge: true
      , (err, written) ->
        return next err if err
        written.should.be.true()
        fs.readFile ssh, "#{scratch}/user.yml", 'utf8', (err, data) ->
          return next err if err
          data.should.eql 'user:\n  preference:\n    color: rouge\n'
          next()

  they 'disregard undefined within merge', (ssh, next) ->
    content = 'user:\n  preference:\n    language: node\n    name:    toto\n'
    fs.writeFile ssh, "#{scratch}/user.yml", content, (err) ->
      return next err if err
      mecano.write_yaml
        ssh: ssh
        content: user: preference:
          language: 'node'
          name: null
        target: "#{scratch}/user.yml"
        merge: true
      , (err, written) ->
        return next err if err
        written.should.be.true()
        fs.readFile ssh, "#{scratch}/user.yml", 'utf8', (err, data) ->
          return next err if err
          data.should.eql 'user:\n  preference:\n    language: node\n'
          next()

  they 'disregard undefined within merge', (ssh, next) ->
    content = 'user:\n  preference:\n    language: node\n  name: toto\ngroup: hadoop_user\n'
    fs.writeFile ssh, "#{scratch}/user.yml", content, (err) ->
      return next err if err
      mecano.write_yaml
        ssh: ssh
        content:
          group: null
        target: "#{scratch}/user.yml"
        merge: true
      , (err, written) ->
        return next err if err
        written.should.be.true()
        fs.readFile ssh, "#{scratch}/user.yml", 'utf8', (err, data) ->
          return next err if err
          data.should.eql 'user:\n  preference:\n    language: node\n  name: toto\n'
          next()
