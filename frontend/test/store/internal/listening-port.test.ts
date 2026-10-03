import { test } from '../../test.js'
import { assertEqual, assertThrowsWithMessage } from '../../assert.js'
import { listeningPort } from './listening-port.js'

test('give the port of a server listening on one', () => {
  assertEqual(listeningPort({ port: 3001 }), 3001)
})

test('throw for a server that is not listening', () => {
  assertThrowsWithMessage(() => listeningPort(null), 'server is not listening')
})

test('throw for a server listening on a pipe', () => {
  assertThrowsWithMessage(
    () => listeningPort('/tmp/beer.sock'),
    'server listens on a pipe, not a port: /tmp/beer.sock',
  )
})
