import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import BreweryEditor from './BreweryEditor'

const id = 'a89fbb3e-df4b-4ee6-ad88-887936726df3'
const namePlaceholder = 'Name'

test('edits valid brewery', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <BreweryEditor
      brewery={{
        id,
        name: ''
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />
  )
  const nameInput = getByPlaceholderText(namePlaceholder)
  await user.type(nameInput, 'Salama')
  const calls = onChange.mock.calls
  expect(calls.length).toEqual(6)
  expect(calls[calls.length - 1]).toEqual([{
    id,
    name: 'Salama'
  }])
})

test('edits invalid brewery by empty name', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <BreweryEditor
      brewery={{
        id,
        name: '',
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />
  )
  const nameInput = getByPlaceholderText(namePlaceholder)
  await user.type(nameInput, 'S')
  await user.clear(nameInput)
  const calls = onChange.mock.calls
  expect(calls.length).toEqual(2)
  expect(calls[calls.length - 1]).toEqual([undefined])
})

test('renders values', async () => {
  const onChange = vitest.fn()
  const { getByDisplayValue } = render(
    <BreweryEditor
      brewery={{
        id,
        name: 'Koskipanimo'
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />
  )
  getByDisplayValue('Koskipanimo')
})
