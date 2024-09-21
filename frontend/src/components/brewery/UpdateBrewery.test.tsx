import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import UpdateBrewery from './UpdateBrewery'

const id = 'a992b512-c636-486c-a85f-33938da9101c'
const newNamePlaceholder = 'New name'

test('updates container', async () => {
  const user = userEvent.setup()
  const onSaved = vitest.fn()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <UpdateBrewery
      initialBrewery={{
        id,
        name: 'Koksipanimo'
      }}
      updateBreweryIf={{
        useUpdate: () => ({
          update,
          isLoading: false
        })
      }}
      onCancel={() => {}}
      onSaved={onSaved}
    />
  )
  const saveButton = getByRole('button', { name: 'Save' })
  const nameInput = getByPlaceholderText(newNamePlaceholder)
  user.clear(nameInput)
  await act(async () => await user.type(nameInput, 'Koskipanimo'))
  expect(saveButton.hasAttribute('disabled')).toEqual(false)
  await act(async() => saveButton.click())
  const updateCalls = update.mock.calls
  expect(updateCalls).toEqual([[{
    id,
    name: 'Koskipanimo'
  }]])
  const saveCalls = onSaved.mock.calls
  expect(saveCalls).toEqual([[]])
})
