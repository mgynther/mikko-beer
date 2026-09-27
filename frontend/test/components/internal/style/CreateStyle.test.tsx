import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import CreateStyle from '../../../../src/components/internal/style/CreateStyle'
import type { UseDebounce } from '../../../../src/components/types/types'
import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import { dontCall } from '../../../dont-call'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const parent = {
  id: '1771b86d-236f-40e8-a4ce-cb464cdce2d1',
  name: 'Ale',
  parents: [],
}

const otherParent = {
  id: '6ebda485-2b36-4ec6-8793-3579066eecca',
  name: 'Lager',
  parents: [],
}

const useSearch: SearchFieldIf = {
  useSearchField: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
}

test('creates style', async () => {
  const user = setupUser()
  const select = mockFunction()
  const create = mockFunction()
  const createdId = 'cb5636a9-0c9a-4a6b-8558-29e4f0918a32'
  const name = 'Cream Ale'
  const { getByPlaceholderText, getByRole } = render(
    <CreateStyle
      selectStyleIf={{
        create: {
          useCreate: () => ({
            create,
            createdStyle: { id: createdId, name },
            hasError: false,
            isLoading: false,
            isSuccess: create.mock.calls.length === 1,
          }),
        },
        list: {
          useList: () => ({
            styles: [parent, otherParent],
            isLoading: false,
          }),
          searchFieldIf: useSearch,
        },
      }}
      remove={dontCall}
      select={select}
    />,
  )
  const nameInput = getByPlaceholderText('Name')
  await user.clear(nameInput)
  await user.type(nameInput, name)

  async function search(): Promise<void> {
    const searchInput = getByPlaceholderText('Search style')
    await user.type(searchInput, 'a')
  }

  await search()
  const parentOption = getByRole('option', { name: parent.name })
  await user.click(parentOption)
  await search()
  const otherParentOption = getByRole('option', { name: otherParent.name })
  await user.click(otherParentOption)

  const createButton = getByRole('button', { name: 'Create' })
  await user.click(createButton)
  assertDeepEqual(create.mock.calls, [
    [
      {
        name,
        parents: [parent, otherParent].map((p) => p.id),
      },
    ],
  ])

  // Something is needed here to trigger rendering. In the full application it
  // happens on its own.
  await user.clear(nameInput)
  assertDeepEqual(select.mock.calls, [
    [
      {
        id: createdId,
        name,
      },
    ],
  ])
})

test('removes style', async () => {
  const remove = mockFunction()
  const { getByRole } = render(
    <CreateStyle
      selectStyleIf={{
        create: {
          useCreate: () => ({
            create: dontCall,
            createdStyle: undefined,
            hasError: false,
            isLoading: false,
            isSuccess: false,
          }),
        },
        list: {
          useList: () => ({
            styles: [parent, otherParent],
            isLoading: false,
          }),
          searchFieldIf: useSearch,
        },
      }}
      remove={remove}
      select={dontCall}
    />,
  )
  const removeButton = getByRole('button', { name: 'Remove' })
  removeButton.click()
  assertDeepEqual(remove.mock.calls, [[]])
})
