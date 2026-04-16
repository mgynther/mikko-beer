import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import SelectStyles from './SelectStyles'
import type { UseDebounce } from '../../core/types'
import type { StyleWithParentIds } from '../../core/style/types'
import type { SearchIf } from '../../core/search/types'

const dontCall = (): any => {
  throw new Error('must not be called')
}

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

const useSearch: SearchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
}

test('removes style', async () => {
  const user = userEvent.setup()
  const select = vitest.fn()
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
        },
      }}
      searchIf={useSearch}
    />,
  )
  const changeButtons = getAllByRole('button', { name: 'Change' })
  await user.click(changeButtons[0])

  const removeButton = getByRole('button', { name: 'Remove' })
  await user.click(removeButton)

  const calls = select.mock.calls
  expect(calls.length).toEqual(3)
  expect(calls[calls.length - 1]).toEqual([[style.id]])
})

test('selects style', async () => {
  const user = userEvent.setup()
  const select = vitest.fn()
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
        },
      }}
      searchIf={useSearch}
    />,
  )
  const searchInput = getByPlaceholderText('Search style')
  await user.type(searchInput, 'Pils')
  const styleButton = getByRole('button', { name: style.name })
  await user.click(styleButton)

  const calls = select.mock.calls
  expect(calls.length).toEqual(2)
  expect(calls[calls.length - 1]).toEqual([[style.id]])
})

test('adds new style', async () => {
  const user = userEvent.setup()
  const select = vitest.fn()
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
        },
      }}
      searchIf={useSearch}
    />,
  )
  const addButton = getByRole('button', { name: 'Add style' })
  await user.click(addButton)

  const calls = select.mock.calls
  expect(calls.length).toEqual(1)
  expect(calls[calls.length - 1]).toEqual([[]])
  getByRole('radio', { name: 'Create' })
  getByRole('radio', { name: 'Select' })
})

test('selects created style', async () => {
  const user = userEvent.setup()
  const create = vitest.fn()
  const select = vitest.fn()
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
        },
      }}
      searchIf={useSearch}
    />,
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
  expect(create.mock.calls).toEqual([
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
  expect(calls.length).toEqual(2)
  expect(calls[calls.length - 1]).toEqual([[newStyle.id]])
})
