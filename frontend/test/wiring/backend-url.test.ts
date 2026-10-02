import { test } from '../test'
import { assertEqual, assertThrowsWithMessage } from '../assert'
import { requireBackendUrl } from '../../src/wiring/backend-url'

test('the configured backend url is used as it is', () => {
  assertEqual(
    requireBackendUrl('http://localhost:3001'),
    'http://localhost:3001',
  )
})

test('a missing backend url stops the application', () => {
  assertThrowsWithMessage(() => {
    requireBackendUrl(undefined)
  }, 'VITE_BACKEND_URL is not set')
})

test('an empty backend url stops the application', () => {
  assertThrowsWithMessage(() => {
    requireBackendUrl('')
  }, 'VITE_BACKEND_URL is not set')
})
