import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import StyleEditor from '../../../../src/components/internal/style/StyleEditor'
import type { UseDebounce } from '../../../../src/components/types/types'
import type { ListStylesIf } from '../../../../src/components/types/style/types'
import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import { dontCall } from '../../../dont-call'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const id = '17d234da-032d-41a3-b526-b3dc63ba019a'
const name = 'IPA'

const parent = {
  id: 'fd949954-935f-4c35-afb3-38f618cde88e',
  name: 'Ale',
}

const otherParent = {
  id: '2df4cd9f-bff2-496d-b1a7-e6b6b6dd12e0',
  name: 'Lager',
}

const dontUseSearch: SearchFieldIf = {
  useSearchField: () => ({
    activate: dontCall,
    isActive: false,
  }),
  useDebounce,
}

const noList: ListStylesIf = {
  useList: () => ({
    styles: [],
    isLoading: false,
  }),
  searchFieldIf: dontUseSearch,
}

test('renders contents', async () => {
  const { getByDisplayValue, getByText } = render(
    <StyleEditor
      initialStyle={{
        id,
        name,
        parents: [parent, otherParent],
      }}
      hasError={false}
      listStylesIf={noList}
      onChange={dontCall}
    />,
  )
  getByDisplayValue(name)
  getByText(parent.name)
  getByText(otherParent.name)
})

test('renders error', async () => {
  const { getByText } = render(
    <StyleEditor
      initialStyle={{
        id,
        name,
        parents: [parent, otherParent],
      }}
      hasError={true}
      listStylesIf={noList}
      onChange={dontCall}
    />,
  )
  getByText('Error saving. Please check parents and try again')
})

test('removes parent', async () => {
  const user = setupUser()
  const onChange = mockFunction()
  const { getAllByRole } = render(
    <StyleEditor
      initialStyle={{
        id,
        name,
        parents: [parent, otherParent],
      }}
      hasError={false}
      listStylesIf={noList}
      onChange={onChange}
    />,
  )
  const removeButtons = getAllByRole('button', { name: 'Remove' })
  assertEqual(removeButtons.length, 2)
  await user.click(removeButtons[0])
  assertDeepEqual(onChange.mock.calls, [
    [
      {
        id,
        name,
        parents: [otherParent.id],
      },
    ],
  ])
})

test('enters name', async () => {
  const user = setupUser()
  const onChange = mockFunction()
  const { getByPlaceholderText } = render(
    <StyleEditor
      initialStyle={{
        id,
        name,
        parents: [parent, otherParent],
      }}
      hasError={false}
      listStylesIf={noList}
      onChange={onChange}
    />,
  )
  const nameInput = getByPlaceholderText('Name')
  await user.clear(nameInput)
  const newName = 'Cream Ale'
  await user.type(nameInput, newName)
  const calls = onChange.mock.calls
  assertDeepEqual(calls[calls.length - 1], [
    {
      id,
      name: newName,
      parents: [parent, otherParent].map((parent) => parent.id),
    },
  ])
})
