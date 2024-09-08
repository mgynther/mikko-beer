import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import ContainerEditor from './ContainerEditor'

const id = 'f8b01ff9-3daa-4137-81cd-f16cf9073d48'
const sizePlaceholder = 'Size, for example 0.25'
const typePlaceholder = 'Type'

test('edits valid container', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <ContainerEditor
      initialContainer={{
        id,
        type: '',
        size: ''
      }}
      onChange={onChange}
    />
  )
  const typeInput = getByPlaceholderText(typePlaceholder)
  await user.type(typeInput, 'Bottle')
  const sizeInput = getByPlaceholderText(sizePlaceholder)
  await user.type(sizeInput, '0.33')
  const validCalls = onChange.mock.calls.filter(args => args[0] !== undefined)
  expect(validCalls).toEqual([[{
    id,
    type: 'Bottle',
    size: '0.33'
  }]])
})

test('edits invalid container by empty type', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <ContainerEditor
      initialContainer={{
        id,
        type: '',
        size: ''
      }}
      onChange={onChange}
    />
  )
  const sizeInput = getByPlaceholderText(sizePlaceholder)
  await user.type(sizeInput, '0.33')
  const validCalls = onChange.mock.calls.filter(args => args[0] !== undefined)
  expect(validCalls.length).toEqual(0)
})

test('edits invalid container by invalid size', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <ContainerEditor
      initialContainer={{
        id,
        type: '',
        size: ''
      }}
      onChange={onChange}
    />
  )
  const typeInput = getByPlaceholderText(typePlaceholder)
  await user.type(typeInput, 'Bottle')
  const sizeInput = getByPlaceholderText(sizePlaceholder)
  await user.type(sizeInput, '0.3')
  const validCalls = onChange.mock.calls.filter(args => args[0] !== undefined)
  expect(validCalls.length).toEqual(0)
})

test('renders values', async () => {
  const onChange = vitest.fn()
  const { getByDisplayValue } = render(
    <ContainerEditor
      initialContainer={{
        id,
        type: 'Draft',
        size: '1.01'
      }}
      onChange={onChange}
    />
  )
  getByDisplayValue('Draft')
  getByDisplayValue('1.01')
})
