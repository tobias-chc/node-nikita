
nikita = require '../../src'
test = require '../test'

describe 'api events "handled"', ->

  it 'provide a single log argument', ->
    nikita()
    .on 'handled', (log) ->
      arguments.length.should.eql 1
      Object.keys(log).should.eql [
        'type', 'index', 'depth', 'error'
        'status', 'level', 'time', 'module'
        'header_depth', 'total_depth'
        'shy', 'file', 'line'
      ]
    .call (_, callback) ->
      callback()
    .promise()

  it 'is called when action is finished', ->
    history = []
    nikita()
    .on 'handled', ->
      history.push 'event handled'
    .call ->
      history.push 'action 1 handler'
    , ->
      history.push 'action 1 callback'
    .call ->
      history.push 'action 2 handler'
    , ->
      history.push 'action 2 callback'
    .next ->
      history.should.eql [
        'action 1 handler',
        'event handled',
        'action 1 callback',
        'action 2 handler',
        'event handled',
        'action 2 callback' 
      ]
    .promise()
