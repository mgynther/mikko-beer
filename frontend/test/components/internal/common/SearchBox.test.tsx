import { test } from '../../../test'
import {
  assertCalledWith,
  assertDeepEqual,
  assertDefined,
  assertEqual,
  assertInstanceOf,
} from '../../../assert'
import { mockFunction } from '../../../mock'
import type { MockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'

import SearchBox from '../../../../src/components/internal/common/SearchBox'
import type {
  Props,
  SearchBoxItem,
} from '../../../../src/components/internal/common/SearchBox'
import { loadingIndicatorText } from '../../../../src/components/internal/common/LoadingIndicator'
import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import type { UseDebounce } from '../../../../src/components/types/types'
import { dontCall } from '../../../dont-call'

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
  assertInstanceOf(inputElement, HTMLInputElement)
})

test('activates', async () => {
  const user = setupUser()
  let useSearchCount = 0
  const search = {
    activate: mockFunction(),
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
  assertEqual(search.activate.mock.calls.length, 1)
  assertEqual(useSearchCount, 1)
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
  assertDeepEqual(item, null)
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
  assertDefined(item)
  const loadingText = getByText(loadingIndicatorText)
  assertDefined(loadingText)
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
  assertDeepEqual(item, null)
})

test('formats custom name', async () => {
  const itemName = 'Must not be visible'
  const customFormattedName = 'Must be visible'
  const selector = mockFunction()
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
  assertEqual(realName, null)
  const formattedName = getByText(customFormattedName)
  assertDefined(formattedName)
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
  assertDefined(text)
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
  assertDefined(text)
})

test('item is selected', async () => {
  const user = setupUser()
  const itemName = 'Must be visible'
  const selector = mockFunction()
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
  assertDefined(itemOption)
  await user.click(itemOption)
  assertDeepEqual(selector.mock.calls, [[{ id: '1', name: itemName }]])
})

test('renders filter', async () => {
  const filter = 'Must render this'
  const { getByRole } = render(
    <SearchBox {...defaultProps} currentFilter={filter} />,
  )
  const input = getByRole('combobox')
  assertInstanceOf(input, HTMLInputElement)
  assertEqual(input.value, filter)
})

test('clears filter', async () => {
  const user = setupUser()
  const setter = mockFunction()
  const { getByRole } = render(
    <SearchBox
      {...defaultProps}
      currentFilter={'Some text'}
      setFilter={setter}
    />,
  )
  const clearButton = getByRole('button')
  assertDefined(clearButton)
  await user.click(clearButton)
  assertCalledWith(setter, [''])
})

test('inputs text', async () => {
  const user = setupUser()
  const setter = mockFunction()
  const { getByRole } = render(
    <SearchBox {...defaultProps} setFilter={setter} />,
  )
  const input = getByRole('combobox')
  assertDefined(input)
  await user.type(input, 'Test')
  const expected = [['T'], ['e'], ['s'], ['t']]
  assertDeepEqual(setter.mock.calls, expected)
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
  assertDefined(loadingText)
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
  assertDeepEqual(
    itemOptions.map((item) => item.innerHTML),
    ['item a', 'item b'],
  )
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
  assertDeepEqual(
    itemOptions.map((item) => item.innerHTML),
    ['Lager', 'American lager'],
  )
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
  assertDeepEqual(
    itemOptions.map((item) => item.innerHTML),
    ['item', 'item', 'item 321', 'abc item 123', 'testing item'],
  )
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
  assertEqual(itemOptions.length, 3)
  assertDeepEqual(
    itemOptions.map((item) => item.innerHTML),
    ['item b', 'item a', 'item a'],
  )
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
  assertEqual(input.getAttribute('aria-expanded'), 'false')
  assertEqual(input.getAttribute('aria-autocomplete'), 'list')
  assertEqual(input.getAttribute('aria-activedescendant'), null)
  assertEqual(queryByRole('listbox'), null)
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
  assertEqual(input.getAttribute('aria-expanded'), 'true')
  const listbox = getByRole('listbox', { name: title })
  assertEqual(input.getAttribute('aria-controls'), listbox.getAttribute('id'))
  const options = getAllByRole('option')
  assertDeepEqual(
    options.map((option) => option.innerHTML),
    ['item a', 'item b', 'item c'],
  )
  assertDeepEqual(
    options.map((option) => option.getAttribute('aria-selected')),
    ['false', 'false', 'false'],
  )
})

interface KeyboardRender {
  getActiveOption: () => string | null
  input: HTMLElement
  options: HTMLElement[]
  select: MockFunction
  setFilter: MockFunction
}

function renderForKeyboard(
  currentOptions: SearchBoxItem[] = keyboardOptions,
): KeyboardRender {
  const select = mockFunction()
  const setFilter = mockFunction()
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
      assertEqual(active.length, 1)
      assertEqual(active[0].getAttribute('aria-selected'), 'true')
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
  assertEqual(getActiveOption(), null)
  await user.type(input, '{ArrowDown}')
  assertEqual(getActiveOption(), 'item a')
})

test('highlights the next option with arrow down', async () => {
  const user = setupUser()
  const { getActiveOption, input } = renderForKeyboard()
  await user.type(input, '{ArrowDown}{ArrowDown}')
  assertEqual(getActiveOption(), 'item b')
})

test('wraps to the first option with arrow down', async () => {
  const user = setupUser()
  const { getActiveOption, input } = renderForKeyboard()
  await user.type(input, '{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}')
  assertEqual(getActiveOption(), 'item a')
})

test('highlights the last option with arrow up', async () => {
  const user = setupUser()
  const { getActiveOption, input } = renderForKeyboard()
  await user.type(input, '{ArrowUp}')
  assertEqual(getActiveOption(), 'item c')
})

test('highlights the previous option with arrow up', async () => {
  const user = setupUser()
  const { getActiveOption, input } = renderForKeyboard()
  await user.type(input, '{ArrowDown}{ArrowDown}{ArrowUp}')
  assertEqual(getActiveOption(), 'item a')
})

test('wraps to the last option with arrow up', async () => {
  const user = setupUser()
  const { getActiveOption, input } = renderForKeyboard()
  await user.type(input, '{ArrowDown}{ArrowUp}')
  assertEqual(getActiveOption(), 'item c')
})

test('arrow keys highlight nothing without options', async () => {
  const user = setupUser()
  const { getActiveOption, input } = renderForKeyboard([])
  await user.type(input, '{ArrowDown}{ArrowUp}')
  assertEqual(getActiveOption(), null)
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
  assertEqual(input.getAttribute('aria-activedescendant'), lastId)
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
  assertEqual(getAllByRole('option').length, 1)
  assertEqual(input.getAttribute('aria-activedescendant'), null)
})

test('selects the highlighted option with enter', async () => {
  const user = setupUser()
  const { input, select, setFilter } = renderForKeyboard()
  await user.type(input, '{ArrowDown}{ArrowDown}{Enter}')
  assertDeepEqual(select.mock.calls, [[keyboardOptions[1]]])
  assertDeepEqual(setFilter.mock.calls, [['']])
})

test('enter selects nothing without a highlight', async () => {
  const user = setupUser()
  const { input, select, setFilter } = renderForKeyboard()
  await user.type(input, '{Enter}')
  assertDeepEqual(select.mock.calls, [])
  assertDeepEqual(setFilter.mock.calls, [])
})

test('clears the filter on escape', async () => {
  const user = setupUser()
  const { getActiveOption, input, setFilter } = renderForKeyboard()
  await user.type(input, '{ArrowDown}')
  assertEqual(getActiveOption(), 'item a')
  await user.type(input, '{Escape}')
  assertDeepEqual(setFilter.mock.calls, [['']])
  assertEqual(getActiveOption(), null)
})

test('clicking an option clears the highlight', async () => {
  const user = setupUser()
  const { getActiveOption, input, options } = renderForKeyboard()
  await user.type(input, '{ArrowDown}')
  await user.click(options[2])
  assertEqual(getActiveOption(), null)
})
