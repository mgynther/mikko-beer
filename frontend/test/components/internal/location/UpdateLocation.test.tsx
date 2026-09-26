import { render } from '@testing-library/react'
import { setupUser } from '../../../user-event'
import { expect, test, vitest } from 'vitest'
import UpdateLocation from '../../../../src/components/internal/location/UpdateLocation'
import { Role } from '../../../../src/components/types/user/types'
import type { GetLogin } from '../../../../src/components/types/login/types'
import { buildLogin } from '../../types/login/builders'
import { buildUser } from '../../types/user/builders'

const id = 'e00e1994-026c-4be6-93f2-4b247a0f0ce8'
const newNamePlaceholder = 'New name'

function getLogin(): GetLogin {
  return () => buildLogin({ user: buildUser({ role: Role.admin }) })
}

test('updates location', async () => {
  const user = setupUser()
  const onSaved = vitest.fn()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <UpdateLocation
      initialLocation={{
        id,
        name: 'Panimoarvintola Plevna',
      }}
      updateLocationIf={{
        useUpdate: () => ({
          update,
          isLoading: false,
        }),
        getLogin: getLogin(),
      }}
      onCancel={() => undefined}
      onSaved={onSaved}
    />,
  )
  const saveButton = getByRole('button', { name: 'Save' })
  const nameInput = getByPlaceholderText(newNamePlaceholder)
  await user.clear(nameInput)
  await user.type(nameInput, 'Panimoravintola Plevna')
  expect(saveButton.hasAttribute('disabled')).toEqual(false)
  await user.click(saveButton)
  const updateCalls = update.mock.calls
  expect(updateCalls).toEqual([
    [
      {
        id,
        name: 'Panimoravintola Plevna',
      },
    ],
  ])
  const saveCalls = onSaved.mock.calls
  expect(saveCalls).toEqual([[]])
})

test('cancel update', async () => {
  const user = setupUser()
  const onCancel = vitest.fn()
  const { getByRole } = render(
    <UpdateLocation
      initialLocation={{
        id,
        name: 'Panimoarvintola Plevna',
      }}
      updateLocationIf={{
        useUpdate: () => ({
          update: async (): Promise<void> => undefined,
          isLoading: false,
        }),
        getLogin: getLogin(),
      }}
      onCancel={onCancel}
      onSaved={() => undefined}
    />,
  )
  const cancelButton = getByRole('button', { name: 'Cancel' })
  await user.click(cancelButton)
  const cancelCalls = onCancel.mock.calls
  expect(cancelCalls).toEqual([[]])
})
