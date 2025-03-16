import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'

import SearchBox from './SearchBox'
import type { Props, SearchBoxItem } from './SearchBox'
import { loadingIndicatorText } from './LoadingIndicator'
import type { SearchIf } from '../../core/search/types'
import type { UseDebounce } from '../../core/types'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const useDebounce: UseDebounce = str => str

const passiveSearch: SearchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: false
  }),
  useDebounce
}

const activeSearch: SearchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true
  }),
  useDebounce
}

const defaultProps: Props<SearchBoxItem> = {
  searchIf: passiveSearch,
  currentFilter: '',
  currentOptions: [],
  customSort: undefined,
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
  const { getByRole } = render(
    <SearchBox
      { ...defaultProps }
      searchIf={{
        useSearch: () => {
          if (useSearchCount > 0) {
            throw new Error('Multiple calls not allowed')
          }
          useSearchCount++
          return search
        },
        useDebounce
      }}
    />
  )
  await user.click(getByRole('button'))
  expect(search.activate.mock.calls.length).toEqual(1)
  expect(useSearchCount).toEqual(1)
})

test('does not show items when inactive', () => {
  const itemName = 'Must not be visible'
  const { queryByText } = render(
    <SearchBox
      { ...defaultProps }
      currentFilter={"M"}
      currentOptions={[{
        id: '1',
        name: itemName
      }]}
    />
  )
  const item = queryByText(itemName)
  expect(item).toEqual(null)
})

test('show items while loading', async () => {
  const itemName = 'Must be visible'
  const { getByText } = render(
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
  const item = getByText(itemName)
  expect(item).toBeDefined()
  const loadingText = getByText(loadingIndicatorText)
  expect(loadingText).toBeDefined()
})

test('does not show items while filter empty', async () => {
  const itemName = 'Must not be visible'
  const { queryByText } = render(
    <SearchBox
      { ...defaultProps }
      searchIf={activeSearch}
      currentOptions={[{
        id: '1',
        name: itemName
      }]}
    />
  )
  const item = queryByText(itemName)
  expect(item).toEqual(null)
})

test('formats custom name', async () => {
  const itemName = 'Must not be visible'
  const customFormattedName = 'Must be visible'
  const selector = vitest.fn()
  const { getByText, queryByText } = render(
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
  const realName = queryByText(itemName)
  expect(realName).toBeNull()
  const formattedName = getByText(customFormattedName)
  expect(formattedName).toBeDefined()
})

test('renders more results info', async () => {
  const { getByText } = render(
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
  const text = getByText('There are more results. Refine search...')
  expect(text).toBeDefined()
})

test('renders no results info', async () => {
  const { getByText } = render(
    <SearchBox
      { ...defaultProps }
      searchIf={activeSearch}
      currentFilter={'M'}
    />
  )
  const text = getByText('No results')
  expect(text).toBeDefined()
})

test('item is selected', async () => {
  const user = userEvent.setup()
  const itemName = 'Must be visible'
  const selector = vitest.fn()
  const { getByRole } = render(
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
  const itemButton = getByRole('button', { name: itemName })
  expect(itemButton).toBeDefined()
  await user.click(itemButton)
  expect(selector.mock.calls).toEqual([[ { id: '1', name: itemName } ]])
})

test('renders filter', async () => {
  const filter = 'Must render this'
  const { getByRole } = render(
    <SearchBox
      { ...defaultProps }
      currentFilter={filter}
    />
  )
  const input = getByRole('textbox')
  expect(input).toBeInstanceOf(HTMLInputElement)
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * No other way to access value of input. Also type already checked.
   */
  expect((input as HTMLInputElement).value).toEqual(filter)
})

test('clears filter', async () => {
  const user = userEvent.setup()
  const setter = vitest.fn()
  const { getByRole } = render(
    <SearchBox
      { ...defaultProps }
      currentFilter={'Some text'}
      setFilter={setter}
    />
  )
  const clearButton = getByRole('button')
  expect(clearButton).toBeDefined()
  await user.click(clearButton)
  expect(setter).toHaveBeenCalledWith('')
})

test('inputs text', async () => {
  const user = userEvent.setup()
  const setter = vitest.fn()
  const { getByRole } = render(
    <SearchBox
      { ...defaultProps }
      setFilter={setter}
    />
  )
  const input = getByRole('textbox')
  expect(input).toBeDefined()
  await user.type(input, 'Test')
  const expected = [ [ 'T' ], [ 'e' ], [ 's' ], [ 't' ] ]
  expect(setter.mock.calls).toEqual(expected)
})

test('shows loading indicator', async () => {
  const { getByText } = render(
    <SearchBox
      { ...defaultProps }
      searchIf={activeSearch}
      currentFilter={'M'}
      isLoading={true}
    />
  )
  const loadingText = getByText(loadingIndicatorText)
  expect(loadingText).toBeDefined()
})

test('sorts results', async () => {
  const { getAllByRole } = render(
    <SearchBox
      { ...defaultProps }
      searchIf={activeSearch}
      currentFilter={'M'}
      currentOptions={[
        {
          id: '1',
          name: 'item b'
        },
        {
          id: '2',
          name: 'item a'
        }
      ]}
      select={dontCall}
    />
  )
  const itemButtons = getAllByRole('button', { name: /item/ })
  expect(itemButtons.map(item => item.innerHTML)).toEqual(['item a', 'item b'])
})

test('custom sorts results', async () => {
  const { getAllByRole } = render(
    <SearchBox
      { ...defaultProps }
      customSort={(a: SearchBoxItem, b: SearchBoxItem) =>
        -1 * a.name.localeCompare(b.name)
      }
      searchIf={activeSearch}
      currentFilter={'M'}
      currentOptions={[
        {
          id: '1',
          name: 'item b'
        },
        {
          id: '2',
          name: 'item a'
        }
      ]}
      select={dontCall}
    />
  )
  const itemButtons = getAllByRole('button', { name: /item/ })
  expect(itemButtons.length).toEqual(2)
  expect(itemButtons.map(item => item.innerHTML)).toEqual(['item b', 'item a'])
})
