import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import LocationEditor from './LocationEditor'

const id = '444f76de-2b62-4e03-bcc3-1fc068d21e38'
const namePlaceholder = 'Name'

test('edits valid location', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <LocationEditor
      location={{
        id,
        name: ''
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />
  )
  const nameInput = getByPlaceholderText(namePlaceholder)
  await user.type(nameInput, 'Viisi Penniä')
  const calls = onChange.mock.calls
  expect(calls.length).toEqual(12)
  expect(calls[calls.length - 1]).toEqual([{
    id,
    name: 'Viisi Penniä'
  }])
})

test('edits invalid location by empty name', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <LocationEditor
      location={{
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
    <LocationEditor
      location={{
        id,
        name: 'Panimoravintola Plevna'
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />
  )
  getByDisplayValue('Panimoravintola Plevna')
})
