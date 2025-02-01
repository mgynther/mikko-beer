import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import UpdateLocation from './UpdateLocation'
import { Role } from '../../core/user/types'

const id = 'e00e1994-026c-4be6-93f2-4b247a0f0ce8'
const newNamePlaceholder = 'New name'

function getLogin() {
  return () => ({
    user: {
      id: '3ae3514d-4fbe-416c-add4-85b6fbc76922',
      username: 'admin',
      role: Role.admin
    },
    authToken: 'auth',
    refreshToken: 'refresh'
  })
}

test('updates location', async () => {
  const user = userEvent.setup()
  const onSaved = vitest.fn()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <UpdateLocation
      initialLocation={{
        id,
        name: 'Panimoarvintola Plevna'
      }}
      updateLocationIf={{
        useUpdate: () => ({
          update,
          isLoading: false
        }),
        login: getLogin()
      }}
      onCancel={() => undefined}
      onSaved={onSaved}
    />
  )
  const saveButton = getByRole('button', { name: 'Save' })
  const nameInput = getByPlaceholderText(newNamePlaceholder)
  await user.clear(nameInput)
  await user.type(nameInput, 'Panimoravintola Plevna')
  expect(saveButton.hasAttribute('disabled')).toEqual(false)
  await user.click(saveButton)
  const updateCalls = update.mock.calls
  expect(updateCalls).toEqual([[{
    id,
    name: 'Panimoravintola Plevna'
  }]])
  const saveCalls = onSaved.mock.calls
  expect(saveCalls).toEqual([[]])
})
