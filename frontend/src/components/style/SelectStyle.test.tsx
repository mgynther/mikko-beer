import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import SelectStyle from './SelectStyle'
import type { UseDebounce } from '../../core/types'
import type { StyleWithParentIds } from '../../core/style/types'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const useDebounce: UseDebounce = str => str

const parent = {
  id: '1771b86d-236f-40e8-a4ce-cb464cdce2d1',
  name: 'Ale',
  parents: []
}

const style = {
  id: 'e98a6062-2ba4-480d-b8ce-af5220401022',
  name: 'Session Pale Ale',
  parents: [parent.id]
}

const useSearch = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true
  }),
  useDebounce
}

test('selects style', async () => {
  const user = userEvent.setup()
  const select = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <SelectStyle
      remove={() => undefined}
      select={select}
      selectStyleIf={{
        create: {
          useCreate: dontCall
        },
        list: {
          useList: () => ({
            styles: [parent, style],
            isLoading: false
          })
        }
      }}
      searchIf={useSearch}
    />
  )
  const searchInput = getByPlaceholderText('Search style')
  await user.type(searchInput, 'Ses')
  const styleButton = getByRole('button', { name: style.name })
  await user.click(styleButton)

  expect(select.mock.calls).toEqual([[{
    ...style
  }]])
})

test('selects created style', async () => {
  const user = userEvent.setup()
  const create = vitest.fn()
  const select = vitest.fn()
  const newStyle: StyleWithParentIds = {
    id: 'ed6921a0-ae9e-46f1-9e96-677032b6c7db',
    name: 'IPA',
    parents: [parent.id]
  }
  const { getByPlaceholderText, getByRole, } = render(
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
            isSuccess: true
          })
        },
        list: {
          useList: () => ({
            styles: [parent, style],
            isLoading: false
          })
        }
      }}
      searchIf={useSearch}
    />
  )
  const createRadio = getByRole('radio', { name: 'Create' })
  await user.click(createRadio)

  const nameInput = getByPlaceholderText('Name')
  await user.clear(nameInput)
  await user.type(nameInput, newStyle.name)

  const searchInput = getByPlaceholderText('Search style')
  await user.type(searchInput, 'a')
  const parentButton = getByRole('button', { name: parent.name })
  await user.click(parentButton)

  const createButton = getByRole('button', { name: 'Create' })
  await user.click(createButton)
  expect(create.mock.calls).toEqual([[{
    name: newStyle.name,
    parents: [parent].map(p => p.id)
  }]])

  // Something is needed here to trigger rendering. In the full application it
  // happens on its own.
  await user.clear(nameInput)
  expect(select.mock.calls).toEqual([[{
    ...newStyle
  }]])
})
