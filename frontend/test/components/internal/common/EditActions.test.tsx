import { test } from '../../../test'
import {
  assertCallCount,
  assertCalled,
  assertDefined,
  assertEqual,
} from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import EditActions from '../../../../src/components/internal/common/EditActions'
import { loadingIndicatorText } from '../../../../src/components/internal/common/LoadingIndicator'

test('renders loading text', () => {
  const { getByText } = render(
    <EditActions
      isSaving={true}
      isSaveDisabled={false}
      onCancel={() => undefined}
      onSave={() => undefined}
    />,
  )
  const text = getByText(loadingIndicatorText)
  assertDefined(text)
})

test('disables save button while saving', () => {
  const saveCb = mockFunction()
  const { getByRole } = render(
    <EditActions
      isSaving={true}
      isSaveDisabled={false}
      onCancel={() => undefined}
      onSave={saveCb}
    />,
  )
  const saveButton = getByRole('button', { name: 'Save' })
  assertEqual(saveButton.hasAttribute('disabled'), true)
  saveButton.click()
  assertCallCount(saveCb, 0)
})

test('disables save button without onSave', () => {
  const { getByRole } = render(
    <EditActions
      isSaving={true}
      isSaveDisabled={false}
      onCancel={() => undefined}
      onSave={undefined}
    />,
  )
  const saveButton = getByRole('button', { name: 'Save' })
  assertEqual(saveButton.hasAttribute('disabled'), true)
})

test('disables save button while saving disabled', () => {
  const saveCb = mockFunction()
  const { getByRole } = render(
    <EditActions
      isSaving={false}
      isSaveDisabled={true}
      onCancel={() => undefined}
      onSave={saveCb}
    />,
  )
  const saveButton = getByRole('button', { name: 'Save' })
  assertEqual(saveButton.hasAttribute('disabled'), true)
  saveButton.click()
  assertCallCount(saveCb, 0)
})

test('cancels', () => {
  const cancelCb = mockFunction()
  const { getByRole } = render(
    <EditActions
      isSaving={false}
      isSaveDisabled={false}
      onCancel={cancelCb}
      onSave={() => undefined}
    />,
  )
  const cancelButton = getByRole('button', { name: 'Cancel' })
  assertEqual(cancelButton.hasAttribute('disabled'), false)
  cancelButton.click()
  assertCalled(cancelCb)
})

test('saves', () => {
  const saveCb = mockFunction()
  const { getByRole } = render(
    <EditActions
      isSaving={false}
      isSaveDisabled={false}
      onCancel={() => undefined}
      onSave={saveCb}
    />,
  )
  const saveButton = getByRole('button', { name: 'Save' })
  assertEqual(saveButton.hasAttribute('disabled'), false)
  saveButton.click()
  assertCalled(saveCb)
})
