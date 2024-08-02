import { render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import EditActions from './EditActions'
import { loadingIndicatorText } from './LoadingIndicator'

test('renders loading text', () => {
  const { getByText } = render(
    <EditActions
      isSaving={true}
      isSaveDisabled={false}
      onCancel={() => {}}
      onSave={() => {}}
    />
  )
  const text = getByText(loadingIndicatorText)
  expect(text).toBeDefined()
})

test('disables save button while saving', () => {
  const saveCb = vitest.fn()
  const { getByRole } = render(
    <EditActions
      isSaving={true}
      isSaveDisabled={false}
      onCancel={() => {}}
      onSave={saveCb}
    />
  )
  const saveButton = getByRole('button', { name: 'Save' })
  expect(saveButton.hasAttribute('disabled')).toEqual(true)
  saveButton.click()
  expect(saveCb).not.toHaveBeenCalled()
})

test('disables save button while saving disabled', () => {
  const saveCb = vitest.fn()
  const { getByRole } = render(
    <EditActions
      isSaving={false}
      isSaveDisabled={true}
      onCancel={() => {}}
      onSave={saveCb}
    />
  )
  const saveButton = getByRole('button', { name: 'Save' })
  expect(saveButton.hasAttribute('disabled')).toEqual(true)
  saveButton.click()
  expect(saveCb).not.toHaveBeenCalled()
})

test('cancels', () => {
  const cancelCb = vitest.fn()
  const { getByRole } = render(
    <EditActions
      isSaving={false}
      isSaveDisabled={false}
      onCancel={cancelCb}
      onSave={() => {}}
    />
  )
  const cancelButton = getByRole('button', { name: 'Cancel' })
  expect(cancelButton.hasAttribute('disabled')).toEqual(false)
  cancelButton.click()
  expect(cancelCb).toHaveBeenCalled()
})

test('saves', () => {
  const saveCb = vitest.fn()
  const { getByRole } = render(
    <EditActions
      isSaving={false}
      isSaveDisabled={false}
      onCancel={() => {}}
      onSave={saveCb}
    />
  )
  const saveButton = getByRole('button', { name: 'Save' })
  expect(saveButton.hasAttribute('disabled')).toEqual(false)
  saveButton.click()
  expect(saveCb).toHaveBeenCalled()
})
