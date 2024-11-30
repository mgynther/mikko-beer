import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import StyleEditor from './StyleEditor'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const useDebounce = (value: string): string => value

const id = '17d234da-032d-41a3-b526-b3dc63ba019a'
const name = 'IPA'

const parent = {
  id: 'fd949954-935f-4c35-afb3-38f618cde88e',
  name: 'Ale'
}

const otherParent = {
  id: '2df4cd9f-bff2-496d-b1a7-e6b6b6dd12e0',
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

test('renders contents', async () => {
  const { getByDisplayValue, getByText } = render(
    <StyleEditor
      initialStyle={{
        id,
        name,
        parents: [
          parent,
          otherParent
        ]
      }}
      hasError={false}
      listStylesIf={noList}
      searchIf={dontUseSearch}
      onChange={dontCall}
    />
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
        parents: [
          parent,
          otherParent
        ]
      }}
      hasError={true}
      listStylesIf={noList}
      searchIf={dontUseSearch}
      onChange={dontCall}
    />
  )
  getByText('Error saving. Please check parents and try again')
})

test('removes parent', async () => {
  const onChange = vitest.fn()
  const { getAllByRole } = render(
    <StyleEditor
      initialStyle={{
        id,
        name,
        parents: [
          parent,
          otherParent
        ]
      }}
      hasError={false}
      listStylesIf={noList}
      searchIf={dontUseSearch}
      onChange={onChange}
    />
  )
  const removeButtons = getAllByRole('button', { name: 'Remove' })
  expect(removeButtons.length).toEqual(2)
  act(() => { removeButtons[0].click(); })
  expect(onChange.mock.calls).toEqual([[{
    id,
    name,
    parents: [otherParent.id]
  }]])
})

test('enters name', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <StyleEditor
      initialStyle={{
        id,
        name,
        parents: [
          parent,
          otherParent
        ]
      }}
      hasError={false}
      listStylesIf={noList}
      searchIf={dontUseSearch}
      onChange={onChange}
    />
  )
  const nameInput = getByPlaceholderText('Name')
  await user.clear(nameInput)
  const newName = 'Cream Ale'
  await user.type(nameInput, newName)
  const calls = onChange.mock.calls
  expect(calls[calls.length - 1]).toEqual([{
    id,
    name: newName,
    parents: [parent, otherParent].map(parent => parent.id)
  }])
})
