import { test } from '../../../test'
import { assertDeepEqual, assertDefined, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'

import SelectCreateRadio, {
  Mode,
  SelectCreateRadioBasic,
} from '../../../../src/components/internal/common/SelectCreateRadio'

test('basic, clicks create when already selected', async () => {
  const user = setupUser()
  const onChange = mockFunction()
  const { getByRole } = render(
    <SelectCreateRadioBasic mode={Mode.CREATE} onChange={onChange} />,
  )
  const create = getByRole('radio', { name: 'Create' })
  assertDefined(create)
  assertEqual(asInput(create).checked, true)
  await user.click(create)
  assertDeepEqual(onChange.mock.calls, [])
})

test('basic, clicks select when already selected', async () => {
  const user = setupUser()
  const onChange = mockFunction()
  const { getByRole } = render(
    <SelectCreateRadioBasic mode={Mode.SELECT} onChange={onChange} />,
  )
  const select = getByRole('radio', { name: 'Select' })
  assertEqual(asInput(select).checked, true)
  assertDefined(select)
  await user.click(select)
  assertDeepEqual(onChange.mock.calls, [])
})

test('basic, clicks create', async () => {
  const user = setupUser()
  const onChange = mockFunction()
  const { getByRole } = render(
    <SelectCreateRadioBasic mode={Mode.SELECT} onChange={onChange} />,
  )
  const create = getByRole('radio', { name: 'Create' })
  assertDefined(create)
  assertEqual(asInput(create).checked, false)
  await user.click(create)
  assertDeepEqual(onChange.mock.calls, [[Mode.CREATE]])
})

test('basic, clicks select', async () => {
  const user = setupUser()
  const onChange = mockFunction()
  const { getByRole } = render(
    <SelectCreateRadioBasic mode={Mode.CREATE} onChange={onChange} />,
  )
  const select = getByRole('radio', { name: 'Select' })
  assertDefined(select)
  assertEqual(asInput(select).checked, false)
  await user.click(select)
  assertDeepEqual(onChange.mock.calls, [[Mode.SELECT]])
})

test('full, changes mode', async () => {
  const user = setupUser()
  const createTextValue = 'This is create'
  const selectTextValue = 'This is select'
  const { getByRole, getByText, queryByText } = render(
    <SelectCreateRadio
      defaultMode={Mode.SELECT}
      createElement={<div>{createTextValue}</div>}
      selectElement={<div>{selectTextValue}</div>}
    />,
  )
  assertEqual(queryByText(createTextValue), null)
  assertDefined(getByText(selectTextValue))

  const create = getByRole('radio', { name: 'Create' })
  assertDefined(create)
  assertEqual(asInput(create).checked, false)
  await user.click(create)
  const createText = getByText(createTextValue)
  assertDefined(createText)
  const selectText = queryByText(selectTextValue)
  assertDeepEqual(selectText, null)

  const select = getByRole('radio', { name: 'Select' })
  assertDefined(select)
  assertEqual(asInput(select).checked, false)
  await user.click(select)
  const secondCreateText = queryByText(createTextValue)
  assertDeepEqual(secondCreateText, null)
  const secondSelectText = getByText(selectTextValue)
  assertDefined(secondSelectText)
})

function asInput(element: HTMLElement): HTMLInputElement {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Unknown in the rtk types.
   */
  return element as HTMLInputElement
}
