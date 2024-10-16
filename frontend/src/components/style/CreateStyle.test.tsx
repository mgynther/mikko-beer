import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import CreateStyle from './CreateStyle'

const dontCall = () => {
  throw new Error('must not be called')
}

const useDebounce = (value: string) => value

const parent = {
  id: '1771b86d-236f-40e8-a4ce-cb464cdce2d1',
  name: 'Ale',
  parents: []
}

const otherParent = {
  id: '6ebda485-2b36-4ec6-8793-3579066eecca',
  name: 'Lager',
  parents: []
}

const useSearch = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true
  }),
  useDebounce
}

test('creates style', async () => {
  const user = userEvent.setup()
  const select = vitest.fn()
  const create = vitest.fn()
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
            isSuccess: create.mock.calls.length === 1
          })
        },
        list: {
          useList: () => ({
            styles: [parent, otherParent],
            isLoading: false
          })
        }
      }}
      remove={dontCall}
      searchIf={useSearch}
      select={select}
    />
  )
  const nameInput = getByPlaceholderText('Name')
  await user.clear(nameInput)
  await user.type(nameInput, name)

  async function search() {
    const searchInput = getByPlaceholderText('Search style')
    await user.type(searchInput, 'a')
  }

  await search()
  const parentButton = getByRole('button', { name: parent.name })
  act(() => parentButton.click())
  await search()
  const otherParentButton = getByRole('button', { name: otherParent.name })
  act(() => otherParentButton.click())

  const createButton = getByRole('button', { name: 'Create' })
  await act(async () => createButton.click())
  expect(create.mock.calls).toEqual([[{
    name: name,
    parents: [parent, otherParent].map(p => p.id)
  }]])

  // Something is needed here to trigger rendering. In the full application it
  // happens on its own.
  await user.clear(nameInput)
  expect(select.mock.calls).toEqual([[{
    id: createdId,
    name
  }]])
})

test('removes style', async () => {
  const remove = vitest.fn()
  const { getByRole } = render(
    <CreateStyle
      selectStyleIf={{
        create: {
          useCreate: () => ({
            create: dontCall,
            createdStyle: undefined,
            hasError: false,
            isLoading: false,
            isSuccess: false
          })
        },
        list: {
          useList: () => ({
            styles: [parent, otherParent],
            isLoading: false
          })
        }
      }}
      remove={remove}
      searchIf={useSearch}
      select={dontCall}
    />
  )
  const removeButton = getByRole('button', { name: 'Remove' })
  removeButton.click()
  expect(remove.mock.calls).toEqual([[]])
})
