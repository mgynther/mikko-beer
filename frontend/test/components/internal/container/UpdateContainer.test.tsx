import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import UpdateContainer from '../../../../src/components/internal/container/UpdateContainer'
import type { Container } from '../../../../src/components/types/container/types'

const id = '6ed0f88e-87d6-418a-af69-709ceea6cf77'
const size = '0.32'
const type = 'Bottle'
const sizePlaceholder = 'Size, for example 0.25'
const typePlaceholder = 'Type'

const container: Container = {
  id,
  size,
  type,
}

test('updates container', async () => {
  const user = setupUser()
  const onSaved = mockFunction<[]>()
  const update = mockFunction<[container: Container], Promise<void>>(
    async () => undefined,
  )
  const { getByPlaceholderText, getByRole } = render(
    <UpdateContainer
      initialContainer={container}
      updateContainerHookIf={{
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
  const typeInput = getByPlaceholderText(typePlaceholder)
  await user.clear(typeInput)
  await user.type(typeInput, 'Draft')
  const sizeInput = getByPlaceholderText(sizePlaceholder)
  await user.clear(sizeInput)
  await user.type(sizeInput, '0.33')
  assertEqual(saveButton.hasAttribute('disabled'), false)
  await user.click(saveButton)
  const updateCalls = update.mock.calls
  assertDeepEqual(updateCalls, [
    [
      {
        id,
        size: '0.33',
        type: 'Draft',
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
    <UpdateContainer
      initialContainer={container}
      updateContainerHookIf={{
        useUpdate: () => ({
          update: async (): Promise<void> => undefined,
          isLoading: false,
        }),
      }}
      onCancel={onCancel}
      onSaved={() => undefined}
    />,
  )
  const cancelButton = getByRole('button', { name: 'Cancel' })
  await user.click(cancelButton)
  const cancelCalls = onCancel.mock.calls
  assertDeepEqual(cancelCalls, [[]])
})
