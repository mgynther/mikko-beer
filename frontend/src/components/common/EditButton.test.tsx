import { render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import EditButton from './EditButton'
import { Role, type User } from '../../core/user/types'
import type { Login } from '../../core/login/types'

const admin: User = {
  id: '123',
  username: 'test',
  role: Role.admin
}

function getLogin(user: User | undefined): Login {
  return {
    user,
    authToken: '',
    refreshToken: ''
  }
}

test('is disabled without user', () => {
  const { queryByRole } = render(
    <EditButton
      disabled={false}
      getLogin={() => getLogin(undefined)}
      onClick={() => {}}
    />
  )
  const button = queryByRole('button')
  expect(button).toEqual(null)
})

test('is disabled for viewer', () => {
  const { queryByRole } = render(
    <EditButton
      disabled={false}
      getLogin={() => getLogin({
        id: '123',
        username: 'test',
        role: Role.viewer
      })}
      onClick={() => {}}
    />
  )
  const button = queryByRole('button')
  expect(button).toEqual(null)
})

test('handles click for admin', () => {
  const clickCb = vitest.fn()
  const { getByRole } = render(
    <EditButton
      disabled={false}
      getLogin={() => getLogin(admin)}
      onClick={clickCb}
    />
  )
  const button = getByRole('button')
  button.click()
  expect(clickCb).toHaveBeenCalled()
})

test('does not handle click when disabled', () => {
  const clickCb = vitest.fn()
  const { getByRole } = render(
    <EditButton
      disabled={true}
      getLogin={() => getLogin(admin)}
      onClick={clickCb}
    />
  )
  const button = getByRole('button')
  button.click()
  expect(clickCb).not.toHaveBeenCalled()
  expect(button.hasAttribute('disabled')).toEqual(true)
})
