import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import UpdateBrewery from '../../../../src/components/internal/brewery/UpdateBrewery'
import { countryPlaceholder } from '../../../../src/components/internal/brewery/BreweryEditor'
import { dontCall } from '../../../dont-call'
import type { Brewery } from '../../../../src/components/types/brewery/types'

const id = 'a992b512-c636-486c-a85f-33938da9101c'
const newNamePlaceholder = 'New name'

test('updates brewery', async () => {
  const user = setupUser()
  const onSaved = mockFunction<[]>()
  const update = mockFunction<[breweryRequest: Brewery]>()
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
  assertEqual(saveButton.hasAttribute('disabled'), false)
  await user.click(saveButton)
  const updateCalls = update.mock.calls
  assertDeepEqual(updateCalls, [
    [
      {
        id,
        name: 'Koskipanimo',
        country: undefined,
      },
    ],
  ])
  const saveCalls = onSaved.mock.calls
  assertDeepEqual(saveCalls, [[]])
})

test('cancel update', async () => {
  const user = setupUser()
  const onCancel = mockFunction<[]>()
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
  assertDeepEqual(cancelCalls, [[]])
})

test('updates brewery country', async () => {
  const user = setupUser()
  const onSaved = mockFunction<[]>()
  const update = mockFunction<[breweryRequest: Brewery]>()
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
  assertEqual(saveButton.hasAttribute('disabled'), false)
  await user.click(saveButton)
  const updateCalls = update.mock.calls
  assertDeepEqual(updateCalls, [
    [
      {
        id,
        name: 'Koskipanimo',
        country: 'FI',
      },
    ],
  ])
  const saveCalls = onSaved.mock.calls
  assertDeepEqual(saveCalls, [[]])
})
