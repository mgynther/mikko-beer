import { test } from '../../test'
import { assertDeepEqual } from '../../assert'
import {
  afterFailedRefresh,
  afterUnauthorized,
} from '../../../src/store/internal/reauthorization'

const user = {
  id: '3b8e1d5a-7c2f-4e9b-a6d1-8f3c5e7a9b2d',
  username: 'user1',
  role: 'admin',
}

const stored = { authToken: 'auth1', refreshToken: 'refresh1', user }

// Another tab refreshed: what is stored now is newer than what was sent.
const refreshedElsewhere = {
  authToken: 'auth2',
  refreshToken: 'refresh2',
  user,
}

test('refresh when the auth token sent is still the stored one', () => {
  assertDeepEqual(afterUnauthorized('auth1', stored), {
    next: 'refresh',
    session: stored,
  })
})

test('retry without refreshing when another tab has refreshed', () => {
  assertDeepEqual(afterUnauthorized('auth1', refreshedElsewhere), {
    next: 'retry',
    session: refreshedElsewhere,
  })
})

test('log out on 401 when no session is stored', () => {
  assertDeepEqual(afterUnauthorized('auth1', undefined), { next: 'logout' })
})

test('log out on 401 when none was sent and none is stored', () => {
  assertDeepEqual(afterUnauthorized('', undefined), { next: 'logout' })
})

test('log out when the refresh token that failed is still stored', () => {
  assertDeepEqual(afterFailedRefresh('refresh1', stored), { next: 'logout' })
})

test('retry when another tab refreshed while this one was refreshing', () => {
  assertDeepEqual(afterFailedRefresh('refresh1', refreshedElsewhere), {
    next: 'retry',
    session: refreshedElsewhere,
  })
})

test('log out after a failed refresh when no session is stored', () => {
  assertDeepEqual(afterFailedRefresh('refresh1', undefined), {
    next: 'logout',
  })
})
