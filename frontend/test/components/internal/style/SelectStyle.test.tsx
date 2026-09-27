import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import SelectStyle from '../../../../src/components/internal/style/SelectStyle'
import type { UseDebounce } from '../../../../src/components/types/types'
import type { StyleWithParentIds } from '../../../../src/components/types/style/types'
import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import { dontCall } from '../../../dont-call'
import type {
  CreateStyleRequest,
  Style,
} from '../../../../src/components/types/style/types'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const parent = {
  id: '1771b86d-236f-40e8-a4ce-cb464cdce2d1',
  name: 'Ale',
  parents: [],
}

const style = {
  id: 'e98a6062-2ba4-480d-b8ce-af5220401022',
  name: 'Session Pale Ale',
  parents: [parent.id],
}

const useSearch: SearchFieldIf = {
  useSearchField: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
}

test('selects style', async () => {
  const user = setupUser()
  const select = mockFunction<[style: Style]>()
  const { getByPlaceholderText, getByRole } = render(
    <SelectStyle
      remove={() => undefined}
      select={select}
      selectStyleIf={{
        create: {
          useCreate: dontCall,
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
  const searchInput = getByPlaceholderText('Search style')
  await user.type(searchInput, 'Ses')
  const styleOption = getByRole('option', { name: style.name })
  await user.click(styleOption)

  assertDeepEqual(select.mock.calls, [
    [
      {
        ...style,
      },
    ],
  ])
})

test('selects created style', async () => {
  const user = setupUser()
  const create = mockFunction<[style: CreateStyleRequest], Promise<void>>(
    async () => undefined,
  )
  const select = mockFunction<[style: Style]>()
  const newStyle: StyleWithParentIds = {
    id: 'ed6921a0-ae9e-46f1-9e96-677032b6c7db',
    name: 'IPA',
    parents: [parent.id],
  }
  const { getByPlaceholderText, getByRole } = render(
    <SelectStyle
      remove={() => undefined}
      select={select}
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
  assertDeepEqual(select.mock.calls, [
    [
      {
        ...newStyle,
      },
    ],
  ])
})
