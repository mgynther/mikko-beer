import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import UpdateContainer from './UpdateContainer'

const id = '6ed0f88e-87d6-418a-af69-709ceea6cf77'
const size = '0.32'
const type = 'Bottle'
const sizePlaceholder = 'Size, for example 0.25'
const typePlaceholder = 'Type'

test('updates container', async () => {
  const user = userEvent.setup()
  const onSaved = vitest.fn()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <UpdateContainer
      initialContainer={{
        id,
        size,
        type
      }}
      updateContainerIf={{
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
  const typeInput = getByPlaceholderText(typePlaceholder)
  user.clear(typeInput)
  await act(async () => await user.type(typeInput, 'Draft'))
  const sizeInput = getByPlaceholderText(sizePlaceholder)
  user.clear(sizeInput)
  await act(async () => await user.type(sizeInput, '0.33'))
  expect(saveButton.hasAttribute('disabled')).toEqual(false)
  await act(async() => saveButton.click())
  const updateCalls = update.mock.calls
  expect(updateCalls).toEqual([[{
    id,
    size: '0.33',
    type: 'Draft'
  }]])
  const saveCalls = onSaved.mock.calls
  expect(saveCalls).toEqual([[]])
})
