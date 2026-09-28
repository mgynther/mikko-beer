import { test } from '../../../test'
import {
  assertCallCount,
  assertCalled,
  assertDeepEqual,
  assertEqual,
} from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import EditButton from '../../../../src/components/internal/common/EditButton'
import { Role, type User } from '../../../../src/components/types/user/types'
import type { Login } from '../../../../src/components/types/login/types'

const admin: User = {
  id: '123',
  username: 'test',
  role: Role.admin,
}

function getLogin(user: User | undefined): Login {
  return {
    user,
  }
}

test('is disabled without user', () => {
  const { queryByRole } = render(
    <EditButton
      disabled={false}
      getLogin={() => getLogin(undefined)}
      onClick={() => undefined}
    />,
  )
  const button = queryByRole('button')
  assertDeepEqual(button, null)
})

test('is disabled for viewer', () => {
  const { queryByRole } = render(
    <EditButton
      disabled={false}
      getLogin={() =>
        getLogin({
          id: '123',
          username: 'test',
          role: Role.viewer,
        })
      }
      onClick={() => undefined}
    />,
  )
  const button = queryByRole('button')
  assertDeepEqual(button, null)
})

test('handles click for admin', async () => {
  const user = setupUser()
  const clickCb = mockFunction<[]>()
  const { getByRole } = render(
    <EditButton
      disabled={false}
      getLogin={() => getLogin(admin)}
      onClick={clickCb}
    />,
  )
  const button = getByRole('button')
  await user.click(button)
  assertCalled(clickCb)
})

test('does not handle click when disabled', async () => {
  const user = setupUser()
  const clickCb = mockFunction<[]>()
  const { getByRole } = render(
    <EditButton
      disabled={true}
      getLogin={() => getLogin(admin)}
      onClick={clickCb}
    />,
  )
  const button = getByRole('button')
  await user.click(button)
  assertCallCount(clickCb, 0)
  assertEqual(button.hasAttribute('disabled'), true)
})
