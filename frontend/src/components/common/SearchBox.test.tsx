import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'

import SearchBox from './SearchBox'
import type { Props, SearchBoxItem } from './SearchBox'
import { loadingIndicatorText } from './LoadingIndicator'
import type { SearchIf } from '../../core/search/types'

const passiveSearch: SearchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: false
  })
}

const activeSearch: SearchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true
  })
}

const defaultProps: Props<SearchBoxItem> = {
  searchIf: passiveSearch,
  currentFilter: '',
  currentOptions: [],
  formatter: (item: SearchBoxItem) => item.name,
  isLoading: false,
  setFilter: () => undefined,
  select: () => undefined,
  title: ''
}

test('renders title', () => {
  const titleText = 'This is title'
  const { getByPlaceholderText } = render(
    <SearchBox
      { ...defaultProps }
      title={titleText}
    />
  )
  const inputElement = getByPlaceholderText(titleText)
  expect(inputElement).toBeInstanceOf(HTMLInputElement)
})

test('activates', async () => {
  const user = userEvent.setup()
  let useSearchCount = 0
  const search = {
    activate: vitest.fn(),
    isActive: false
  }
  render(
    <SearchBox
      { ...defaultProps }
      searchIf={{
        useSearch: () => {
          if (useSearchCount > 0) {
            throw new Error('Multiple calls not allowed')
          }
          useSearchCount++
          return search
        }
      }}
    />
  )
  await user.click(screen.getByRole('button'))
  expect(search.activate.mock.calls.length).toEqual(1)
  expect(useSearchCount).toEqual(1)
})

test('does not show items when inactive', () => {
  const itemName = 'Must not be visible'
  render(
    <SearchBox
      { ...defaultProps }
      currentFilter={"M"}
      currentOptions={[{
        id: '1',
        name: itemName
      }]}
    />
  )
  const item = screen.queryByText(itemName)
  expect(item).toEqual(null)
})

test('does not show items while loading', async () => {
  const itemName = 'Must not be visible'
  render(
    <SearchBox
      { ...defaultProps }
      searchIf={activeSearch}
      currentFilter={'A'}
      currentOptions={[{
        id: '1',
        name: itemName
      }]}
      isLoading={true}
    />
  )
  const item = screen.queryByText(itemName)
  expect(item).toEqual(null)
})

test('does not show items while filter empty', async () => {
  const itemName = 'Must not be visible'
  render(
    <SearchBox
      { ...defaultProps }
      searchIf={activeSearch}
      currentOptions={[{
        id: '1',
        name: itemName
      }]}
    />
  )
  const item = screen.queryByText(itemName)
  expect(item).toEqual(null)
})

test('formats custom name', async () => {
  const itemName = 'Must not be visible'
  const customFormattedName = 'Must be visible'
  const selector = vitest.fn()
  render(
    <SearchBox
      { ...defaultProps }
      searchIf={activeSearch}
      currentFilter={'M'}
      currentOptions={[{
        id: '1',
        name: itemName
      }]}
      formatter={() => customFormattedName}
      select={selector}
    />
  )
  const realName = screen.queryByText(itemName)
  expect(realName).toBeNull()
  const formattedName = screen.getByText(customFormattedName)
  expect(formattedName).toBeDefined()
})

test('renders more results info', async () => {
  render(
    <SearchBox
      { ...defaultProps }
      searchIf={activeSearch}
      currentFilter={'M'}
      currentOptions={Array.from(Array(11).keys()).map(num => ({
        id: `${num}`,
        name: `${num}`
      }))}
    />
  )
  const text = screen.getByText('There are more results. Refine search...')
  expect(text).toBeDefined()
})

test('renders no results info', async () => {
  render(
    <SearchBox
      { ...defaultProps }
      searchIf={activeSearch}
      currentFilter={'M'}
    />
  )
  const text = screen.getByText('No results')
  expect(text).toBeDefined()
})

test('item is selected', async () => {
  const user = userEvent.setup()
  const itemName = 'Must be visible'
  const selector = vitest.fn()
  render(
    <SearchBox
      { ...defaultProps }
      searchIf={activeSearch}
      currentFilter={'M'}
      currentOptions={[{
        id: '1',
        name: itemName
      }]}
      select={selector}
    />
  )
  const itemButton = screen.getByRole('button', { name: itemName })
  expect(itemButton).toBeDefined()
  await user.click(itemButton)
  expect(selector.mock.calls).toEqual([[ { id: '1', name: itemName } ]])
})

test('renders filter', async () => {
  const filter = 'Must render this'
  render(
    <SearchBox
      { ...defaultProps }
      currentFilter={filter}
    />
  )
  const input = screen.getByRole('textbox')
  expect(input).toBeInstanceOf(HTMLInputElement)
  expect((input as HTMLInputElement).value).toEqual(filter)
})

test('clears filter', async () => {
  const user = userEvent.setup()
  const setter = vitest.fn()
  render(
    <SearchBox
      { ...defaultProps }
      currentFilter={'Some text'}
      setFilter={setter}
    />
  )
  const clearButton = screen.getByRole('button')
  expect(clearButton).toBeDefined()
  await user.click(clearButton)
  expect(setter).toHaveBeenCalledWith('')
})

test('inputs text', async () => {
  const user = userEvent.setup()
  const setter = vitest.fn()
  render(
    <SearchBox
      { ...defaultProps }
      setFilter={setter}
    />
  )
  const input = screen.getByRole('textbox')
  expect(input).toBeDefined()
  await user.type(input, 'Test')
  const expected = [ [ 'T' ], [ 'e' ], [ 's' ], [ 't' ] ]
  expect(setter.mock.calls).toEqual(expected)
})

test('shows loading indicator', async () => {
  render(
    <SearchBox
      { ...defaultProps }
      searchIf={activeSearch}
      currentFilter={'M'}
      isLoading={true}
    />
  )
  const loadingText = screen.getByText(loadingIndicatorText)
  expect(loadingText).toBeDefined()
})
