import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import UpdateBrewery from './UpdateBrewery'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const id = 'a992b512-c636-486c-a85f-33938da9101c'
const newNamePlaceholder = 'New name'

test('updates brewery', async () => {
  const user = userEvent.setup()
  const onSaved = vitest.fn()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <UpdateBrewery
      initialBrewery={{
        id,
        name: 'Koksipanimo',
      }}
      updateBreweryIf={{
        useUpdate: () => ({
          update,
          isLoading: false,
        }),
      }}
      onCancel={() => undefined}
      onSaved={onSaved}
    />,
  )
  const saveButton = getByRole('button', { name: 'Save' })
  const nameInput = getByPlaceholderText(newNamePlaceholder)
  await user.clear(nameInput)
  await user.type(nameInput, 'Koskipanimo')
  expect(saveButton.hasAttribute('disabled')).toEqual(false)
  await user.click(saveButton)
  const updateCalls = update.mock.calls
  expect(updateCalls).toEqual([
    [
      {
        id,
        name: 'Koskipanimo',
      },
    ],
  ])
  const saveCalls = onSaved.mock.calls
  expect(saveCalls).toEqual([[]])
})

test('cancel update', async () => {
  const user = userEvent.setup()
  const onCancel = vitest.fn()
  const { getByRole } = render(
    <UpdateBrewery
      initialBrewery={{
        id,
        name: 'Koskipanimo',
      }}
      updateBreweryIf={{
        useUpdate: () => ({
          update: dontCall,
          isLoading: false,
        }),
      }}
      onCancel={onCancel}
      onSaved={dontCall}
    />,
  )
  const cancelButton = getByRole('button', { name: 'Cancel' })
  await user.click(cancelButton)
  const cancelCalls = onCancel.mock.calls
  expect(cancelCalls).toEqual([[]])
})
