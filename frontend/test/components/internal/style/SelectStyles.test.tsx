import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import SelectStyles from '../../../../src/components/internal/style/SelectStyles'
import type { UseDebounce } from '../../../../src/components/types/types'
import type { StyleWithParentIds } from '../../../../src/components/types/style/types'
import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import { dontCall } from '../../../dont-call'
import type { CreateStyleRequest } from '../../../../src/components/types/style/types'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const parent = {
  id: 'c4ebc3fd-eeb1-4e76-bad9-8b0097038f9f',
  name: 'Ale',
  parents: [],
}

const style = {
  id: '0970a9f2-961d-4899-a174-8a79666a32c6',
  name: 'Pils',
  parents: [],
}

const useSearch: SearchFieldIf = {
  useSearchField: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
}

test('removes style', async () => {
  const user = setupUser()
  const select = mockFunction<[styles: string[]]>()
  const { getAllByRole, getByRole } = render(
    <SelectStyles
      select={select}
      initialStyles={[parent, style]}
      selectStyleIf={{
        create: {
          useCreate: dontCall,
        },
        list: {
          useList: () => ({
            styles: [],
            isLoading: false,
          }),
          searchFieldIf: useSearch,
        },
      }}
    />,
  )
  const changeButtons = getAllByRole('button', { name: 'Change' })
  await user.click(changeButtons[0])

  const removeButton = getByRole('button', { name: 'Remove' })
  await user.click(removeButton)

  const calls = select.mock.calls
  assertEqual(calls.length, 3)
  assertDeepEqual(calls[calls.length - 1], [[style.id]])
})

test('selects style', async () => {
  const user = setupUser()
  const select = mockFunction<[styles: string[]]>()
  const { getByPlaceholderText, getByRole } = render(
    <SelectStyles
      select={select}
      initialStyles={[]}
      selectStyleIf={{
        create: {
          useCreate: dontCall,
        },
        list: {
          useList: () => ({
            styles: [style],
            isLoading: false,
          }),
          searchFieldIf: useSearch,
        },
      }}
    />,
  )
  const searchInput = getByPlaceholderText('Search style')
  await user.type(searchInput, 'Pils')
  const styleOption = getByRole('option', { name: style.name })
  await user.click(styleOption)

  const calls = select.mock.calls
  assertEqual(calls.length, 2)
  assertDeepEqual(calls[calls.length - 1], [[style.id]])
})

test('adds new style', async () => {
  const user = setupUser()
  const select = mockFunction<[styles: string[]]>()
  const { getByRole } = render(
    <SelectStyles
      select={select}
      initialStyles={[style]}
      selectStyleIf={{
        create: {
          useCreate: dontCall,
        },
        list: {
          useList: () => ({
            styles: [style],
            isLoading: false,
          }),
          searchFieldIf: useSearch,
        },
      }}
    />,
  )
  const addButton = getByRole('button', { name: 'Add style' })
  await user.click(addButton)

  const calls = select.mock.calls
  assertEqual(calls.length, 1)
  assertDeepEqual(calls[calls.length - 1], [[]])
  getByRole('radio', { name: 'Create' })
  getByRole('radio', { name: 'Select' })
})

test('selects created style', async () => {
  const user = setupUser()
  const create = mockFunction<[style: CreateStyleRequest]>()
  const select = mockFunction<[styles: string[]]>()
  const newStyle: StyleWithParentIds = {
    id: '47c42362-221c-4ae1-8656-1cfd92acfa12',
    name: 'IPA',
    parents: [parent.id],
  }
  const { getByPlaceholderText, getByRole } = render(
    <SelectStyles
      select={select}
      initialStyles={[]}
      selectStyleIf={{
        create: {
          useCreate: () => ({
            create,
            createdStyle: create.mock.calls.length === 1 ? newStyle : undefined,
            hasError: false,
            isLoading: false,
            isSuccess: true,
          }),
        },
        list: {
          useList: () => ({
            styles: [parent, style],
            isLoading: false,
          }),
          searchFieldIf: useSearch,
        },
      }}
    />,
  )
  const createRadio = getByRole('radio', { name: 'Create' })
  await user.click(createRadio)

  const nameInput = getByPlaceholderText('Name')
  await user.clear(nameInput)
  await user.type(nameInput, newStyle.name)

  const searchInput = getByPlaceholderText('Search style')
  await user.type(searchInput, 'a')
  const parentOption = getByRole('option', { name: parent.name })
  await user.click(parentOption)

  const createButton = getByRole('button', { name: 'Create' })
  await user.click(createButton)
  assertDeepEqual(create.mock.calls, [
    [
      {
        name: newStyle.name,
        parents: [parent].map((p) => p.id),
      },
    ],
  ])

  // Something is needed here to trigger rendering. In the full application it
  // happens on its own.
  await user.clear(nameInput)
  const calls = select.mock.calls
  assertEqual(calls.length, 2)
  assertDeepEqual(calls[calls.length - 1], [[newStyle.id]])
})
