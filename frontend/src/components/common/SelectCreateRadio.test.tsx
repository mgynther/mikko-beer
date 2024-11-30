import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import
  SelectCreateRadio,
  { Mode, SelectCreateRadioBasic }
from './SelectCreateRadio'

test('basic, clicks create when already selected', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByRole } = render(
    <SelectCreateRadioBasic
      mode={Mode.CREATE}
      onChange={onChange}
    />
  )
  const create = getByRole('radio', { name: 'Create' })
  expect(create).toBeDefined()
  expect(asInput(create).checked).toEqual(true)
  await user.click(create)
  expect(onChange.mock.calls).toEqual([])
})

test('basic, clicks select when already selected', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByRole } = render(
    <SelectCreateRadioBasic
      mode={Mode.SELECT}
      onChange={onChange}
    />
  )
  const select = getByRole('radio', { name: 'Select' })
  expect(asInput(select).checked).toEqual(true)
  expect(select).toBeDefined()
  await user.click(select)
  expect(onChange.mock.calls).toEqual([])
})

test('basic, clicks create', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByRole } = render(
    <SelectCreateRadioBasic
      mode={Mode.SELECT}
      onChange={onChange}
    />
  )
  const create = getByRole('radio', { name: 'Create' })
  expect(create).toBeDefined()
  expect(asInput(create).checked).toEqual(false)
  await user.click(create)
  expect(onChange.mock.calls).toEqual([[Mode.CREATE]])
})

test('basic, clicks select', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByRole } = render(
    <SelectCreateRadioBasic
      mode={Mode.CREATE}
      onChange={onChange}
    />
  )
  const select = getByRole('radio', { name: 'Select' })
  expect(select).toBeDefined()
  expect(asInput(select).checked).toEqual(false)
  await user.click(select)
  expect(onChange.mock.calls).toEqual([[Mode.SELECT]])
})

test('full, changes mode', async () => {
  const user = userEvent.setup()
  const createTextValue = 'This is create'
  const selectTextValue = 'This is select'
  const { getByRole, getByText, queryByText } = render(
    <SelectCreateRadio
      defaultMode={Mode.SELECT}
      createElement={<div>{createTextValue}</div>}
      selectElement={<div>{selectTextValue}</div>}
    />
  )
  expect(queryByText(createTextValue)).toBeNull()
  expect(getByText(selectTextValue)).toBeDefined()

  const create = getByRole('radio', { name: 'Create' })
  expect(create).toBeDefined()
  expect(asInput(create).checked).toEqual(false)
  await user.click(create)
  const createText = getByText(createTextValue)
  expect(createText).toBeDefined()
  const selectText = queryByText(selectTextValue)
  expect(selectText).toEqual(null)

  const select = getByRole('radio', { name: 'Select' })
  expect(select).toBeDefined()
  expect(asInput(select).checked).toEqual(false)
  await user.click(select)
  const secondCreateText = queryByText(createTextValue)
  expect(secondCreateText).toEqual(null)
  const secondSelectText = getByText(selectTextValue)
  expect(secondSelectText).toBeDefined()
})

function asInput(element: HTMLElement): HTMLInputElement {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Unknown in the rtk types.
   */
  return element as HTMLInputElement
}
