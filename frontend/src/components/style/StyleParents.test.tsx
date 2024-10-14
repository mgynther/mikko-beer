import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import StyleParents from './StyleParents'

const dontCall = () => {
  throw new Error('must not be called')
}

const useDebounce = (value: string) => value

const parent = {
  id: 'aa9d0ed0-ceb5-4d22-80a3-adbb9a526b6b',
  name: 'Ale'
}

const otherParent = {
  id: 'df5e6906-1674-40de-aaaa-9c8909bb6a30',
  name: 'Lager'
}

const noList = {
  useList: () => ({
    styles: [],
    isLoading: false
  })
}

const dontUseSearch = {
  useSearch: () => ({
    activate: dontCall,
    isActive: false
  }),
  useDebounce
}

test('renders parents', async () => {
  const { getByText } = render(
    <StyleParents
      initialParents={[
        parent,
        otherParent
      ]}
      listStylesIf={noList}
      searchIf={dontUseSearch}
      select={dontCall}
    />
  )
  getByText(parent.name)
  getByText(otherParent.name)
})

test('removes parent', async () => {
  const select = vitest.fn()
  const { getAllByRole } = render(
    <StyleParents
      initialParents={[
        parent,
        otherParent
      ]}
      listStylesIf={noList}
      searchIf={dontUseSearch}
      select={select}
    />
  )
  const removeButtons = getAllByRole('button', { name: 'Remove' })
  expect(removeButtons.length).toEqual(2)
  act(() => removeButtons[0].click())
  expect(select.mock.calls).toEqual([[[otherParent.id]]])
})

test('adds parent', async () => {
  const user = userEvent.setup()
  const select = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <StyleParents
      initialParents={[
        otherParent
      ]}
      listStylesIf={{
        useList: () => ({
          styles: [{ ...parent, parents: [] }],
          isLoading: false
        })
      }}
      searchIf={{
        useSearch: () => ({
          activate: () => undefined,
          isActive: true
        }),
        useDebounce
      }}
      select={select}
    />
  )
  const searchField = getByPlaceholderText('Search style')
  await act(async () => await user.type(searchField, parent.name))
  const addButton = getByRole('button', { name: parent.name })
  act(() => addButton.click())
  expect(select.mock.calls).toEqual([[[otherParent.id, parent.id]]])
})
