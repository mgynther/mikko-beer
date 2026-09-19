import { render } from '@testing-library/react'
import { setupUser } from '../../../../test-util/user-event'
import { expect, test, vitest } from 'vitest'
import BreweryEditor, { countryPlaceholder } from './BreweryEditor'

const id = 'a89fbb3e-df4b-4ee6-ad88-887936726df3'
const namePlaceholder = 'Name'

test('edits valid brewery', async () => {
  const user = setupUser()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <BreweryEditor
      brewery={{
        id,
        name: '',
        country: undefined,
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />,
  )
  const nameInput = getByPlaceholderText(namePlaceholder)
  await user.type(nameInput, 'Salama')
  const calls = onChange.mock.calls
  expect(calls.length).toEqual(6)
  expect(calls[calls.length - 1]).toEqual([
    {
      id,
      name: 'Salama',
    },
  ])
})

test('edits invalid brewery by empty name', async () => {
  const user = setupUser()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <BreweryEditor
      brewery={{
        id,
        name: '',
        country: undefined,
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />,
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
        name: 'Koskipanimo',
        country: undefined,
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />,
  )
  getByDisplayValue('Koskipanimo')
})

test('edits valid country', async () => {
  const user = setupUser()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <BreweryEditor
      brewery={{
        id,
        name: 'Koskipanimo',
        country: undefined,
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />,
  )
  const countryInput = getByPlaceholderText(countryPlaceholder)
  await user.type(countryInput, 'FI')
  const calls = onChange.mock.calls
  expect(calls).toEqual([
    [undefined],
    [
      {
        id,
        name: 'Koskipanimo',
        country: 'FI',
      },
    ],
  ])
})

test('edits country in lower case', async () => {
  const user = setupUser()
  const onChange = vitest.fn()
  const { getByDisplayValue, getByPlaceholderText } = render(
    <BreweryEditor
      brewery={{
        id,
        name: 'Koskipanimo',
        country: undefined,
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />,
  )
  const countryInput = getByPlaceholderText(countryPlaceholder)
  await user.type(countryInput, 'fi')
  getByDisplayValue('FI')
  const calls = onChange.mock.calls
  expect(calls[calls.length - 1]).toEqual([
    {
      id,
      name: 'Koskipanimo',
      country: 'FI',
    },
  ])
})

test('edits invalid brewery by non-letter country', async () => {
  const user = setupUser()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <BreweryEditor
      brewery={{
        id,
        name: 'Koskipanimo',
        country: undefined,
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />,
  )
  const countryInput = getByPlaceholderText(countryPlaceholder)
  await user.type(countryInput, '12')
  const calls = onChange.mock.calls
  expect(calls[calls.length - 1]).toEqual([undefined])
})

test('edits empty country to undefined', async () => {
  const user = setupUser()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <BreweryEditor
      brewery={{
        id,
        name: 'Koskipanimo',
        country: 'FI',
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />,
  )
  const countryInput = getByPlaceholderText(countryPlaceholder)
  await user.clear(countryInput)
  const calls = onChange.mock.calls
  expect(calls).toEqual([
    [
      {
        id,
        name: 'Koskipanimo',
        country: undefined,
      },
    ],
  ])
})

test('edits name of brewery with country', async () => {
  const user = setupUser()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <BreweryEditor
      brewery={{
        id,
        name: 'Koskipanimo',
        country: 'FI',
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />,
  )
  const nameInput = getByPlaceholderText(namePlaceholder)
  await user.type(nameInput, '!')
  const calls = onChange.mock.calls
  expect(calls[calls.length - 1]).toEqual([
    {
      id,
      name: 'Koskipanimo!',
      country: 'FI',
    },
  ])
})

test('renders country', async () => {
  const onChange = vitest.fn()
  const { getByDisplayValue } = render(
    <BreweryEditor
      brewery={{
        id,
        name: 'Koskipanimo',
        country: 'FI',
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />,
  )
  getByDisplayValue('FI')
})
