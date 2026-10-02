import { test } from '../../test'
import { assertDeepEqual } from '../../assert'
import { createMemoryStorage } from '../../memory-storage'
import {
  clearSession,
  readSession,
  writeSession,
} from '../../../src/store/internal/session'

const session = {
  authToken: 'auth',
  refreshToken: 'refresh',
  user: {
    id: '6a2d9c4e-8b1f-4a3e-9d7c-2f5e8b1a4c6d',
    username: 'user1',
    role: 'viewer',
  },
}

test('read back the session written', () => {
  const storage = createMemoryStorage()
  writeSession(storage, session)
  assertDeepEqual(readSession(storage), session)
})

test('read no session once cleared', () => {
  const storage = createMemoryStorage()
  writeSession(storage, session)
  clearSession(storage)
  assertDeepEqual(readSession(storage), undefined)
})
