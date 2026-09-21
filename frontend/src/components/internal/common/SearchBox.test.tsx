import { render } from '@testing-library/react'
import { setupUser } from '../../../../test-util/user-event'
import { expect, test, vitest } from 'vitest'

import SearchBox from './SearchBox'
import type { Props, SearchBoxItem } from './SearchBox'
import { loadingIndicatorText } from './LoadingIndicator'
import type { SearchFieldIf } from '../../types/search/types'
import type { UseDebounce } from '../../types/types'
import { dontCall } from '../../../../test-util/dont-call'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const passiveSearch: SearchFieldIf = {
  useSearchField: () => ({
    activate: () => undefined,
    isActive: false,
  }),
  useDebounce,
}

const activeSearch: SearchFieldIf = {
  useSearchField: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
}

const defaultProps: Props<SearchBoxItem> = {
  searchFieldIf: passiveSearch,
  currentFilter: '',
  currentOptions: [],
  customSort: undefined,
  formatter: (item: SearchBoxItem) => item.name,
  isLoading: false,
  setFilter: () => undefined,
  select: () => undefined,
  title: '',
}

test('renders title', () => {
  const titleText = 'This is title'
  const { getByPlaceholderText } = render(
    <SearchBox {...defaultProps} title={titleText} />,
  )
  const inputElement = getByPlaceholderText(titleText)
  expect(inputElement).toBeInstanceOf(HTMLInputElement)
})

test('activates', async () => {
  const user = setupUser()
  let useSearchCount = 0
  const search = {
    activate: vitest.fn(),
    isActive: false,
  }
  const { getByRole } = render(
    <SearchBox
      {...defaultProps}
      searchFieldIf={{
        useSearchField: () => {
          if (useSearchCount > 0) {
            throw new Error('Multiple calls not allowed')
          }
          useSearchCount += 1
          return search
        },
        useDebounce,
      }}
    />,
  )
  await user.click(getByRole('button'))
  expect(search.activate.mock.calls.length).toEqual(1)
  expect(useSearchCount).toEqual(1)
})

test('does not show items when inactive', () => {
  const itemName = 'Must not be visible'
  const { queryByText } = render(
    <SearchBox
      {...defaultProps}
      currentFilter={'M'}
      currentOptions={[
        {
          id: '1',
          name: itemName,
        },
      ]}
    />,
  )
  const item = queryByText(itemName)
  expect(item).toEqual(null)
})

test('show items while loading', async () => {
  const itemName = 'Must be visible'
  const { getByText } = render(
    <SearchBox
      {...defaultProps}
      searchFieldIf={activeSearch}
      currentFilter={'A'}
      currentOptions={[
        {
          id: '1',
          name: itemName,
        },
      ]}
      isLoading={true}
    />,
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
      {...defaultProps}
      searchFieldIf={activeSearch}
      currentOptions={[
        {
          id: '1',
          name: itemName,
        },
      ]}
    />,
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
      {...defaultProps}
      searchFieldIf={activeSearch}
      currentFilter={'M'}
      currentOptions={[
        {
          id: '1',
          name: itemName,
        },
      ]}
      formatter={() => customFormattedName}
      select={selector}
    />,
  )
  const realName = queryByText(itemName)
  expect(realName).toBeNull()
  const formattedName = getByText(customFormattedName)
  expect(formattedName).toBeDefined()
})

test('renders more results info', async () => {
  const { getByText } = render(
    <SearchBox
      {...defaultProps}
      searchFieldIf={activeSearch}
      currentFilter={'M'}
      currentOptions={Array.from(Array(11).keys()).map((num) => ({
        id: `${num}`,
        name: `${num}`,
      }))}
    />,
  )
  const text = getByText('There are more results. Refine search...')
  expect(text).toBeDefined()
})

test('renders no results info', async () => {
  const { getByText } = render(
    <SearchBox
      {...defaultProps}
      searchFieldIf={activeSearch}
      currentFilter={'M'}
    />,
  )
  const text = getByText('No results')
  expect(text).toBeDefined()
})

test('item is selected', async () => {
  const user = setupUser()
  const itemName = 'Must be visible'
  const selector = vitest.fn()
  const { getByRole } = render(
    <SearchBox
      {...defaultProps}
      searchFieldIf={activeSearch}
      currentFilter={'M'}
      currentOptions={[
        {
          id: '1',
          name: itemName,
        },
      ]}
      select={selector}
    />,
  )
  const itemOption = getByRole('option', { name: itemName })
  expect(itemOption).toBeDefined()
  await user.click(itemOption)
  expect(selector.mock.calls).toEqual([[{ id: '1', name: itemName }]])
})

test('renders filter', async () => {
  const filter = 'Must render this'
  const { getByRole } = render(
    <SearchBox {...defaultProps} currentFilter={filter} />,
  )
  const input = getByRole('combobox')
  expect(input).toBeInstanceOf(HTMLInputElement)
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * No other way to access value of input. Also type already checked.
   */
  expect((input as HTMLInputElement).value).toEqual(filter)
})

test('clears filter', async () => {
  const user = setupUser()
  const setter = vitest.fn()
  const { getByRole } = render(
    <SearchBox
      {...defaultProps}
      currentFilter={'Some text'}
      setFilter={setter}
    />,
  )
  const clearButton = getByRole('button')
  expect(clearButton).toBeDefined()
  await user.click(clearButton)
  expect(setter).toHaveBeenCalledWith('')
})

test('inputs text', async () => {
  const user = setupUser()
  const setter = vitest.fn()
  const { getByRole } = render(
    <SearchBox {...defaultProps} setFilter={setter} />,
  )
  const input = getByRole('combobox')
  expect(input).toBeDefined()
  await user.type(input, 'Test')
  const expected = [['T'], ['e'], ['s'], ['t']]
  expect(setter.mock.calls).toEqual(expected)
})

test('shows loading indicator', async () => {
  const { getByText } = render(
    <SearchBox
      {...defaultProps}
      searchFieldIf={activeSearch}
      currentFilter={'M'}
      isLoading={true}
    />,
  )
  const loadingText = getByText(loadingIndicatorText)
  expect(loadingText).toBeDefined()
})

test('sorts results', async () => {
  const { getAllByRole } = render(
    <SearchBox
      {...defaultProps}
      searchFieldIf={activeSearch}
      currentFilter={'M'}
      currentOptions={[
        {
          id: '1',
          name: 'item b',
        },
        {
          id: '2',
          name: 'item a',
        },
      ]}
      select={dontCall}
    />,
  )
  const itemOptions = getAllByRole('option', { name: /item/v })
  expect(itemOptions.map((item) => item.innerHTML)).toEqual([
    'item a',
    'item b',
  ])
})

test('sorts results starting with filter', async () => {
  const { getAllByRole } = render(
    <SearchBox
      {...defaultProps}
      searchFieldIf={activeSearch}
      currentFilter={'lag'}
      currentOptions={[
        {
          id: '1',
          name: 'American lager',
        },
        {
          id: '2',
          name: 'Lager',
        },
      ]}
      select={dontCall}
    />,
  )
  const itemOptions = getAllByRole('option', { name: /lager/iv })
  expect(itemOptions.map((item) => item.innerHTML)).toEqual([
    'Lager',
    'American lager',
  ])
})

test('sorts results with edge cases', async () => {
  const { getAllByRole } = render(
    <SearchBox
      {...defaultProps}
      searchFieldIf={activeSearch}
      currentFilter={'item'}
      currentOptions={[
        {
          id: '1',
          name: 'abc item 123',
        },
        {
          id: '2',
          name: 'item',
        },
        {
          id: '4',
          name: 'item',
        },
        {
          id: '5',
          name: 'item 321',
        },
        {
          id: '3',
          name: 'testing item',
        },
      ]}
      select={dontCall}
    />,
  )
  const itemOptions = getAllByRole('option', { name: /item/iv })
  expect(itemOptions.map((item) => item.innerHTML)).toEqual([
    'item',
    'item',
    'item 321',
    'abc item 123',
    'testing item',
  ])
})

test('custom sorts results', async () => {
  const { getAllByRole } = render(
    <SearchBox
      {...defaultProps}
      customSort={(a: SearchBoxItem, b: SearchBoxItem) =>
        -1 * a.name.localeCompare(b.name)
      }
      searchFieldIf={activeSearch}
      currentFilter={'M'}
      currentOptions={[
        {
          id: '1',
          name: 'item b',
        },
        {
          id: '2',
          name: 'item a',
        },
        {
          id: '3',
          name: 'item a',
        },
      ]}
      select={dontCall}
    />,
  )
  const itemOptions = getAllByRole('option', { name: /item/v })
  expect(itemOptions.length).toEqual(3)
  expect(itemOptions.map((item) => item.innerHTML)).toEqual([
    'item b',
    'item a',
    'item a',
  ])
})

const keyboardOptions: SearchBoxItem[] = [
  {
    id: '1',
    name: 'item a',
  },
  {
    id: '2',
    name: 'item b',
  },
  {
    id: '3',
    name: 'item c',
  },
]

test('renders as a collapsed combobox', () => {
  const title = 'Search item'
  const { getByRole, queryByRole } = render(
    <SearchBox {...defaultProps} title={title} />,
  )
  const input = getByRole('combobox', { name: title })
  expect(input.getAttribute('aria-expanded')).toEqual('false')
  expect(input.getAttribute('aria-autocomplete')).toEqual('list')
  expect(input.getAttribute('aria-activedescendant')).toBeNull()
  expect(queryByRole('listbox')).toBeNull()
})

test('renders as an expanded combobox', () => {
  const title = 'Search item'
  const { getAllByRole, getByRole } = render(
    <SearchBox
      {...defaultProps}
      searchFieldIf={activeSearch}
      currentFilter={'item'}
      currentOptions={keyboardOptions}
      title={title}
    />,
  )
  const input = getByRole('combobox', { name: title })
  expect(input.getAttribute('aria-expanded')).toEqual('true')
  const listbox = getByRole('listbox', { name: title })
  expect(input.getAttribute('aria-controls')).toEqual(
    listbox.getAttribute('id'),
  )
  const options = getAllByRole('option')
  expect(options.map((option) => option.innerHTML)).toEqual([
    'item a',
    'item b',
    'item c',
  ])
  expect(options.map((option) => option.getAttribute('aria-selected'))).toEqual(
    ['false', 'false', 'false'],
  )
})

interface KeyboardRender {
  getActiveOption: () => string | null
  input: HTMLElement
  options: HTMLElement[]
  select: ReturnType<typeof vitest.fn>
  setFilter: ReturnType<typeof vitest.fn>
}

function renderForKeyboard(
  currentOptions: SearchBoxItem[] = keyboardOptions,
): KeyboardRender {
  const select = vitest.fn()
  const setFilter = vitest.fn()
  const { getAllByRole, getByRole, queryAllByRole } = render(
    <SearchBox
      {...defaultProps}
      searchFieldIf={activeSearch}
      currentFilter={'item'}
      currentOptions={currentOptions}
      select={select}
      setFilter={setFilter}
    />,
  )
  const input = getByRole('combobox')
  return {
    // The highlight is read back the way a screen reader reads it rather
    // than from the class the same state also sets.
    getActiveOption: (): string | null => {
      const id = input.getAttribute('aria-activedescendant')
      if (id === null) return null
      const active = queryAllByRole('option').filter(
        (option) => option.getAttribute('id') === id,
      )
      expect(active.length).toEqual(1)
      expect(active[0].getAttribute('aria-selected')).toEqual('true')
      return active[0].innerHTML
    },
    input,
    options: currentOptions.length === 0 ? [] : getAllByRole('option'),
    select,
    setFilter,
  }
}

test('highlights the first option with arrow down', async () => {
  const user = setupUser()
  const { getActiveOption, input } = renderForKeyboard()
  expect(getActiveOption()).toBeNull()
  await user.type(input, '{ArrowDown}')
  expect(getActiveOption()).toEqual('item a')
})

test('highlights the next option with arrow down', async () => {
  const user = setupUser()
  const { getActiveOption, input } = renderForKeyboard()
  await user.type(input, '{ArrowDown}{ArrowDown}')
  expect(getActiveOption()).toEqual('item b')
})

test('wraps to the first option with arrow down', async () => {
  const user = setupUser()
  const { getActiveOption, input } = renderForKeyboard()
  await user.type(input, '{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}')
  expect(getActiveOption()).toEqual('item a')
})

test('highlights the last option with arrow up', async () => {
  const user = setupUser()
  const { getActiveOption, input } = renderForKeyboard()
  await user.type(input, '{ArrowUp}')
  expect(getActiveOption()).toEqual('item c')
})

test('highlights the previous option with arrow up', async () => {
  const user = setupUser()
  const { getActiveOption, input } = renderForKeyboard()
  await user.type(input, '{ArrowDown}{ArrowDown}{ArrowUp}')
  expect(getActiveOption()).toEqual('item a')
})

test('wraps to the last option with arrow up', async () => {
  const user = setupUser()
  const { getActiveOption, input } = renderForKeyboard()
  await user.type(input, '{ArrowDown}{ArrowUp}')
  expect(getActiveOption()).toEqual('item c')
})

test('arrow keys highlight nothing without options', async () => {
  const user = setupUser()
  const { getActiveOption, input } = renderForKeyboard([])
  await user.type(input, '{ArrowDown}{ArrowUp}')
  expect(getActiveOption()).toBeNull()
})

test('drops a highlight the options no longer have', async () => {
  const user = setupUser()
  const { getAllByRole, getByRole, rerender } = render(
    <SearchBox
      {...defaultProps}
      searchFieldIf={activeSearch}
      currentFilter={'item'}
      currentOptions={keyboardOptions}
      select={dontCall}
    />,
  )
  const input = getByRole('combobox')
  await user.type(input, '{ArrowUp}')
  const lastId = getAllByRole('option')[2].getAttribute('id')
  expect(input.getAttribute('aria-activedescendant')).toEqual(lastId)
  // A request answering with fewer results than the highlight was moved
  // into must not leave it pointing past the end of the list.
  rerender(
    <SearchBox
      {...defaultProps}
      searchFieldIf={activeSearch}
      currentFilter={'item'}
      currentOptions={[keyboardOptions[0]]}
      select={dontCall}
    />,
  )
  expect(getAllByRole('option').length).toEqual(1)
  expect(input.getAttribute('aria-activedescendant')).toBeNull()
})

test('selects the highlighted option with enter', async () => {
  const user = setupUser()
  const { input, select, setFilter } = renderForKeyboard()
  await user.type(input, '{ArrowDown}{ArrowDown}{Enter}')
  expect(select.mock.calls).toEqual([[keyboardOptions[1]]])
  expect(setFilter.mock.calls).toEqual([['']])
})

test('enter selects nothing without a highlight', async () => {
  const user = setupUser()
  const { input, select, setFilter } = renderForKeyboard()
  await user.type(input, '{Enter}')
  expect(select.mock.calls).toEqual([])
  expect(setFilter.mock.calls).toEqual([])
})

test('clears the filter on escape', async () => {
  const user = setupUser()
  const { getActiveOption, input, setFilter } = renderForKeyboard()
  await user.type(input, '{ArrowDown}')
  expect(getActiveOption()).toEqual('item a')
  await user.type(input, '{Escape}')
  expect(setFilter.mock.calls).toEqual([['']])
  expect(getActiveOption()).toBeNull()
})

test('clicking an option clears the highlight', async () => {
  const user = setupUser()
  const { getActiveOption, input, options } = renderForKeyboard()
  await user.type(input, '{ArrowDown}')
  await user.click(options[2])
  expect(getActiveOption()).toBeNull()
})
