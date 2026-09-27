import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import StyleParents from '../../../../src/components/internal/style/StyleParents'
import type { UseDebounce } from '../../../../src/components/types/types'
import type { ListStylesIf } from '../../../../src/components/types/style/types'
import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import { dontCall } from '../../../dont-call'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const parent = {
  id: 'aa9d0ed0-ceb5-4d22-80a3-adbb9a526b6b',
  name: 'Ale',
}

const otherParent = {
  id: 'df5e6906-1674-40de-aaaa-9c8909bb6a30',
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

test('renders parents', async () => {
  const { getByText } = render(
    <StyleParents
      initialParents={[parent, otherParent]}
      listStylesIf={noList}
      select={dontCall}
    />,
  )
  getByText(parent.name)
  getByText(otherParent.name)
})

test('removes parent', async () => {
  const user = setupUser()
  const select = mockFunction<[parents: string[]]>()
  const { getAllByRole } = render(
    <StyleParents
      initialParents={[parent, otherParent]}
      listStylesIf={noList}
      select={select}
    />,
  )
  const removeButtons = getAllByRole('button', { name: 'Remove' })
  assertEqual(removeButtons.length, 2)
  await user.click(removeButtons[0])
  assertDeepEqual(select.mock.calls, [[[otherParent.id]]])
})

test('adds parent', async () => {
  const user = setupUser()
  const select = mockFunction<[parents: string[]]>()
  const searchFieldIf: SearchFieldIf = {
    useSearchField: () => ({
      activate: () => undefined,
      isActive: true,
    }),
    useDebounce,
  }
  const { getByPlaceholderText, getByRole } = render(
    <StyleParents
      initialParents={[otherParent]}
      listStylesIf={{
        useList: () => ({
          styles: [{ ...parent, parents: [] }],
          isLoading: false,
        }),
        searchFieldIf,
      }}
      select={select}
    />,
  )
  const searchField = getByPlaceholderText('Search style')
  await user.type(searchField, parent.name)
  const addOption = getByRole('option', { name: parent.name })
  await user.click(addOption)
  assertDeepEqual(select.mock.calls, [[[otherParent.id, parent.id]]])
})
