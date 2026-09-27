import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import BreweryEditor, {
  countryPlaceholder,
} from '../../../../src/components/internal/brewery/BreweryEditor'

const id = 'a89fbb3e-df4b-4ee6-ad88-887936726df3'
const namePlaceholder = 'Name'

test('edits valid brewery', async () => {
  const user = setupUser()
  const onChange = mockFunction()
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
  assertEqual(calls.length, 6)
  assertDeepEqual(calls[calls.length - 1], [
    {
      id,
      name: 'Salama',
      country: undefined,
    },
  ])
})

test('edits invalid brewery by empty name', async () => {
  const user = setupUser()
  const onChange = mockFunction()
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
  assertEqual(calls.length, 2)
  assertDeepEqual(calls[calls.length - 1], [undefined])
})

test('renders values', async () => {
  const onChange = mockFunction()
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
  const onChange = mockFunction()
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
  assertDeepEqual(calls, [
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
  const onChange = mockFunction()
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
  assertDeepEqual(calls[calls.length - 1], [
    {
      id,
      name: 'Koskipanimo',
      country: 'FI',
    },
  ])
})

test('edits invalid brewery by non-letter country', async () => {
  const user = setupUser()
  const onChange = mockFunction()
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
  assertDeepEqual(calls[calls.length - 1], [undefined])
})

test('edits empty country to undefined', async () => {
  const user = setupUser()
  const onChange = mockFunction()
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
  assertDeepEqual(calls, [
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
  const onChange = mockFunction()
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
  assertDeepEqual(calls[calls.length - 1], [
    {
      id,
      name: 'Koskipanimo!',
      country: 'FI',
    },
  ])
})

test('renders country', async () => {
  const onChange = mockFunction()
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
