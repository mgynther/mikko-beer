import { render } from '@testing-library/react'
import { setupUser } from '../../../test-util/user-event'
import { expect, test, vitest } from 'vitest'
import UpdateBrewery from './UpdateBrewery'
import { countryPlaceholder } from './BreweryEditor'
import { dontCall } from '../../../test-util/dont-call'

const id = 'a992b512-c636-486c-a85f-33938da9101c'
const newNamePlaceholder = 'New name'

test('updates brewery', async () => {
  const user = setupUser()
  const onSaved = vitest.fn()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <UpdateBrewery
      initialBrewery={{
        id,
        name: 'Koksipanimo',
        country: undefined,
      }}
      updateBreweryHookIf={{
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
  const user = setupUser()
  const onCancel = vitest.fn()
  const { getByRole } = render(
    <UpdateBrewery
      initialBrewery={{
        id,
        name: 'Koskipanimo',
        country: undefined,
      }}
      updateBreweryHookIf={{
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

test('updates brewery country', async () => {
  const user = setupUser()
  const onSaved = vitest.fn()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <UpdateBrewery
      initialBrewery={{
        id,
        name: 'Koskipanimo',
        country: undefined,
      }}
      updateBreweryHookIf={{
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
  const countryInput = getByPlaceholderText(countryPlaceholder)
  await user.type(countryInput, 'FI')
  expect(saveButton.hasAttribute('disabled')).toEqual(false)
  await user.click(saveButton)
  const updateCalls = update.mock.calls
  expect(updateCalls).toEqual([
    [
      {
        id,
        name: 'Koskipanimo',
        country: 'FI',
      },
    ],
  ])
  const saveCalls = onSaved.mock.calls
  expect(saveCalls).toEqual([[]])
})
