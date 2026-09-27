import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import ContainerEditor from '../../../../src/components/internal/container/ContainerEditor'

const id = 'f8b01ff9-3daa-4137-81cd-f16cf9073d48'
const sizePlaceholder = 'Size, for example 0.25'
const typePlaceholder = 'Type'

test('edits valid container', async () => {
  const user = setupUser()
  const onChange = mockFunction()
  const { getByPlaceholderText } = render(
    <ContainerEditor
      initialContainer={{
        id,
        type: '',
        size: '',
      }}
      onChange={onChange}
    />,
  )
  const typeInput = getByPlaceholderText(typePlaceholder)
  await user.type(typeInput, 'Bottle')
  const sizeInput = getByPlaceholderText(sizePlaceholder)
  await user.type(sizeInput, '0.33')
  const validCalls = onChange.mock.calls.filter((args) => args[0] !== undefined)
  assertDeepEqual(validCalls, [
    [
      {
        id,
        type: 'Bottle',
        size: '0.33',
      },
    ],
  ])
})

test('edits invalid container by empty type', async () => {
  const user = setupUser()
  const onChange = mockFunction()
  const { getByPlaceholderText } = render(
    <ContainerEditor
      initialContainer={{
        id,
        type: '',
        size: '',
      }}
      onChange={onChange}
    />,
  )
  const sizeInput = getByPlaceholderText(sizePlaceholder)
  await user.type(sizeInput, '0.33')
  const validCalls = onChange.mock.calls.filter((args) => args[0] !== undefined)
  assertEqual(validCalls.length, 0)
})

test('edits invalid container by invalid size', async () => {
  const user = setupUser()
  const onChange = mockFunction()
  const { getByPlaceholderText } = render(
    <ContainerEditor
      initialContainer={{
        id,
        type: '',
        size: '',
      }}
      onChange={onChange}
    />,
  )
  const typeInput = getByPlaceholderText(typePlaceholder)
  await user.type(typeInput, 'Bottle')
  const sizeInput = getByPlaceholderText(sizePlaceholder)
  await user.type(sizeInput, '0.3')
  const validCalls = onChange.mock.calls.filter((args) => args[0] !== undefined)
  assertEqual(validCalls.length, 0)
})

test('renders values', async () => {
  const onChange = mockFunction()
  const { getByDisplayValue } = render(
    <ContainerEditor
      initialContainer={{
        id,
        type: 'Draft',
        size: '1.01',
      }}
      onChange={onChange}
    />,
  )
  getByDisplayValue('Draft')
  getByDisplayValue('1.01')
})
