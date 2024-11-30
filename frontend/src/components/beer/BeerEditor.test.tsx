import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import BeerEditor from './BeerEditor'
import type {
  Brewery,
  SearchBreweryIf,
  SelectBreweryIf
} from '../../core/brewery/types'
import type {
  CreateStyleIf,
  Style,
  StyleWithParentIds
} from '../../core/style/types'
import type { UseDebounce } from '../../core/types'
import type { EditBeerIf } from '../../core/beer/types'

const useDebounce: UseDebounce = str => str

const dontCall = (): any => {
  throw new Error('must not be called')
}

const dontCreate = {
  create: dontCall,
  isLoading: false
}

const id = '70fea6bb-ab07-4054-8125-f07157ae6b66'
const beerName = 'Piikkivyö'
const namePlaceholder = 'Name'

const brewery: Brewery = {
  id: '9a145362-452f-4a21-b17d-7529fc2caa4b',
  name: 'Panimo Himo'
}

const anotherBrewery: Brewery = {
  id: '4566c772-9de8-4edc-89fe-32c358b3dc23',
  name: 'Tuju'
}

const breweries: Brewery[] = [
  brewery,
  anotherBrewery
]

const style: Style = {
  id: '7d105898-3ae2-4095-bf76-84ff2f9493d9',
  name: 'barley wine'
}

const styleWithParentIds: StyleWithParentIds = {
  ...style,
  parents: [
    '3ef62437-196b-463d-8e10-acf70e28af54'
  ]
}

const styles: Style[] = [
  style
]

const search: SearchBreweryIf = {
  useSearch: () => ({
    search: async () => ([
      brewery,
      anotherBrewery
    ]),
    isLoading: false
  })
}

const doSearch = {
  useSearch: () => ({
    activate: () => undefined,
      isActive: true
  }),
  useDebounce
}

const dontSearch = {
  useSearch: () => ({
    activate: dontCall,
    isActive: false
  }),
  useDebounce
}

const dontSelectBrewery: SelectBreweryIf = {
  create: {
    useCreate: () => dontCreate,
  },
  search: {
    useSearch: () => ({
      search: dontCall,
      isLoading: false
    })
  }
}

const dontCreateStyleIf: CreateStyleIf = {
  useCreate: () => ({
    ...dontCreate,
    createdStyle: undefined,
    hasError: false,
    isSuccess: false
  })
}

const dontEditBeer: EditBeerIf = {
  selectBreweryIf: dontSelectBrewery,
  selectStyleIf: {
    create: dontCreateStyleIf,
    list: {
      useList: () => ({
        styles: [],
        isLoading: false,
      })
    }
  }
}

const dontSelectStyle = {
  create: dontCreateStyleIf,
  list: {
    useList: () => ({
      styles: undefined,
      isLoading: false,
    })
  }
}

const initialBeer = {
  id,
  breweries,
  name: beerName,
  styles
}

test('edits beer name', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <BeerEditor
      initialBeer={{
        ...initialBeer,
        name: ''
      }}
      searchIf={dontSearch}
      onChange={onChange}
      editBeerIf={{
        selectBreweryIf: dontSelectBrewery,
        selectStyleIf: dontSelectStyle
      }}
    />
  )
  const nameInput = getByPlaceholderText(namePlaceholder)
  await user.clear(nameInput)
  await user.type(nameInput, beerName)
  const calls = onChange.mock.calls
  expect(calls[calls.length - 1]).toEqual([{
    id,
    breweries: breweries.map(b => b.id),
    styles: styles.map(s => s.id),
    name: beerName
  }])
})

test('edits beer breweries', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <BeerEditor
      initialBeer={{
        ...initialBeer,
        breweries: []
      }}
      searchIf={doSearch}
      onChange={onChange}
      editBeerIf={{
        selectBreweryIf: {
          create: {
            useCreate: () => dontCreate,
          },
          search
        },
        selectStyleIf: dontSelectStyle
      }}
    />
  )
  const brewerySearch = getByPlaceholderText('Search brewery')
  await user.type(brewerySearch, brewery.name)
  const breweryButton = getByRole('button', { name: brewery.name })
  breweryButton.click()
  const calls = onChange.mock.calls
  expect(calls[calls.length - 1]).toEqual([{
    id,
    breweries: [brewery.id],
    styles: styles.map(s => s.id),
    name: beerName
  }])
})

test('edits beer styles', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <BeerEditor
      initialBeer={{
        ...initialBeer,
        styles: []
      }}
      searchIf={doSearch}
      onChange={onChange}
      editBeerIf={{
        selectBreweryIf: dontSelectBrewery,
        selectStyleIf: {
          create: dontCreateStyleIf,
          list: {
            useList: () => ({
              styles: [ styleWithParentIds ],
              isLoading: false,
            })
          }
        }
      }}
    />
  )
  const styleSearch = getByPlaceholderText('Search style')
  await user.type(styleSearch, style.name)
  const styleButton = getByRole('button', { name: style.name })
  styleButton.click()
  const calls = onChange.mock.calls
  expect(calls[calls.length - 1]).toEqual([{
    id,
    breweries: breweries.map(b => b.id),
    styles: [ style.id ],
    name: beerName
  }])
})

test('edits invalid beer by empty name', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getByPlaceholderText } = render(
    <BeerEditor
      editBeerIf={dontEditBeer}
      initialBeer={{
        ...initialBeer,
        name: ''
      }}
      onChange={onChange}
      searchIf={dontSearch}
    />
  )
  const nameInput = getByPlaceholderText(namePlaceholder)
  await user.type(nameInput, 'S')
  await user.clear(nameInput)
  const calls = onChange.mock.calls
  expect(calls[calls.length - 1]).toEqual([undefined])
})

test('renders values', async () => {
  const onChange = vitest.fn()
  const { getByText, getByDisplayValue } = render(
    <BeerEditor
      editBeerIf={dontEditBeer}
      initialBeer={initialBeer}
      onChange={onChange}
      searchIf={dontSearch}
    />
  )
  getByText(brewery.name)
  getByText(style.name)
  getByDisplayValue(beerName)
})
