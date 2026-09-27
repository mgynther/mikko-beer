import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import LocationEditor from '../../../../src/components/internal/location/LocationEditor'

const id = '444f76de-2b62-4e03-bcc3-1fc068d21e38'
const namePlaceholder = 'Name'

test('edits valid location', async () => {
  const user = setupUser()
  const onChange = mockFunction()
  const { getByPlaceholderText } = render(
    <LocationEditor
      location={{
        id,
        name: '',
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />,
  )
  const nameInput = getByPlaceholderText(namePlaceholder)
  await user.type(nameInput, 'Viisi Penniä')
  const calls = onChange.mock.calls
  assertEqual(calls.length, 12)
  assertDeepEqual(calls[calls.length - 1], [
    {
      id,
      name: 'Viisi Penniä',
    },
  ])
})

test('edits invalid location by empty name', async () => {
  const user = setupUser()
  const onChange = mockFunction()
  const { getByPlaceholderText } = render(
    <LocationEditor
      location={{
        id,
        name: '',
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
    <LocationEditor
      location={{
        id,
        name: 'Panimoravintola Plevna',
      }}
      placeholder={namePlaceholder}
      onChange={onChange}
    />,
  )
  getByDisplayValue('Panimoravintola Plevna')
})
