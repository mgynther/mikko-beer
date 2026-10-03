import { suite, test } from '../../test.js'
import { assertEqual, assertThrows } from '../../assert.js'
import { listeningPort } from '../../../src/web/internal/listening-port.js'

suite('listening port', () => {
  test('give the port of a server listening on one', () => {
    assertEqual(listeningPort({ port: 3001 }), 3001)
  })

  test('throw for a server that is not listening', () => {
    assertThrows(
      () => listeningPort(null),
      new Error('server is not listening'),
      Error,
    )
  })

  test('throw for a server listening on a pipe', () => {
    assertThrows(
      () => listeningPort('/tmp/beer.sock'),
      new Error('server listens on a pipe, not a port: /tmp/beer.sock'),
      Error,
    )
  })
})
