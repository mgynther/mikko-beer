import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import LinkWrapper from './components/LinkWrapper'

import Nav from './Nav'
import type { SearchBeerIf } from './core/beer/types'
import type { SearchIf } from './core/search/types'
import type { SearchBreweryIf } from './core/brewery/types'
import type { NavigateIf } from './components/util'
import { Theme } from './core/types'

const useDebounce: (text: string) => string = (value: string) => value

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dontCall = (): any => {
  throw new Error('must not be called')
}

const dontSearchBeer: SearchBeerIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false
  })
}

const noSearch: SearchIf = {
  useSearch: () => ({
    activate: dontCall,
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

const dontSearchBrewery: SearchBreweryIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false
  })
}

const dontNavigate: NavigateIf = {
  useNavigate: () => dontCall
}

const brewery = {
  id: '60338d36-4f67-47bd-9cac-9fe2b26132f5',
  name: 'Lehe Pruulikoda'
}

const breweries = [brewery]

const styles = [{
  id: 'e7263c85-d38e-429d-8019-b5b9d61da570',
  name: 'Sour'
}]

const beer = {
  id: '3b494ad4-da2b-478a-9abf-82fade8dfc36',
  name: 'Doomino efekt',
  breweries,
  styles
}

const anotherBeer= {
  id: 'b8738024-5f0a-4c74-aed1-b4d42bed9bdf',
  name: 'Incubus',
  breweries,
  styles
}

const beers = [
  beer,
  anotherBeer
]

interface NavigationTest {
  linkText: string
  pathname: string
}

const navigationTests: NavigationTest[] = [
  {
    linkText: 'Add review',
    pathname: '/addreview'
  },
  {
    linkText: 'Beers',
    pathname: '/beers'
  },
  {
    linkText: 'Breweries',
    pathname: '/breweries'
  },
  {
    linkText: 'Reviews',
    pathname: '/reviews'
  },
  {
    linkText: 'Statistics',
    pathname: '/stats'
  },
  {
    linkText: 'Storage',
    pathname: '/storage'
  }
]

navigationTests.forEach(testCase => {
  test(`navigates to ${testCase.pathname}`, async () => {
    const user = userEvent.setup()
    const { getByRole } = render(
      <LinkWrapper>
        <Nav
          isAdmin={true}
          logout={dontCall}
          navigateIf={dontNavigate}
          searchBeerIf={dontSearchBeer}
          searchBreweryIf={dontSearchBrewery}
          searchIf={noSearch}
          setTheme={dontCall}
          theme={Theme.DARK}
        />
      </LinkWrapper>
    )
    const link = getByRole('link', { name: testCase.linkText })
    await user.click(link)
    expect(window.location.pathname).toEqual(testCase.pathname)
  })
})

const navigationMoreTests: NavigationTest[] = [
  {
    linkText: 'Styles',
    pathname: '/styles'
  },
  {
    linkText: 'Containers',
    pathname: '/containers'
  },
  {
    linkText: 'Users',
    pathname: '/users'
  },
  {
    linkText: 'Account',
    pathname: '/account'
  }
]

navigationMoreTests.forEach(testCase => {
  test(`navigates to ${testCase.pathname}`, async () => {
    const user = userEvent.setup()
    const { getByRole } = render(
      <LinkWrapper>
        <Nav
          isAdmin={true}
          logout={dontCall}
          navigateIf={dontNavigate}
          searchBeerIf={dontSearchBeer}
          searchBreweryIf={dontSearchBrewery}
          searchIf={noSearch}
          setTheme={dontCall}
          theme={Theme.DARK}
        />
      </LinkWrapper>
    )
    const moreButton = getByRole('button', { name: 'More' })
    await user.click(moreButton)
    const link = getByRole('link', { name: testCase.linkText })
    await user.click(link)
    expect(window.location.pathname).toEqual(testCase.pathname)
  })
})

navigationMoreTests.forEach(testCase => {
  test(`do not find ${testCase.pathname} without more open`, async () => {
    const { queryByRole } = render(
      <LinkWrapper>
        <Nav
          isAdmin={true}
          logout={dontCall}
          navigateIf={dontNavigate}
          searchBeerIf={dontSearchBeer}
          searchBreweryIf={dontSearchBrewery}
          searchIf={noSearch}
          setTheme={dontCall}
          theme={Theme.DARK}
        />
      </LinkWrapper>
    )
    const link = queryByRole('link', { name: testCase.linkText })
    expect(link).toEqual(null)
  })
})

test('do not find text fields without more open', async () => {
  const { queryByRole } = render(
    <LinkWrapper>
      <Nav
        isAdmin={true}
        logout={dontCall}
        navigateIf={dontNavigate}
        searchBeerIf={dontSearchBeer}
        searchBreweryIf={dontSearchBrewery}
        searchIf={noSearch}
        setTheme={dontCall}
        theme={Theme.DARK}
      />
    </LinkWrapper>
  )
  const fields = queryByRole('textfield')
  expect(fields).toEqual(null)
})

interface ThemeTest {
  original: Theme,
  new: Theme
}

const themeTests: ThemeTest[] = [
  {
    original: Theme.DARK,
    new: Theme.LIGHT
  },
  {
    original: Theme.LIGHT,
    new: Theme.DARK
  }
]

themeTests.forEach(testCase => {
  test(`set theme from ${testCase.original} to ${testCase.new} `, async () => {
    const user = userEvent.setup()
    const setTheme = vitest.fn()
    const { getByRole } = render(
      <LinkWrapper>
        <Nav
          isAdmin={true}
          logout={dontCall}
          navigateIf={dontNavigate}
          searchBeerIf={dontSearchBeer}
          searchBreweryIf={dontSearchBrewery}
          searchIf={noSearch}
          setTheme={setTheme}
          theme={testCase.original}
        />
      </LinkWrapper>
    )
    const moreButton = getByRole('button', { name: 'More' })
    await user.click(moreButton)
    const checkbox = getByRole('checkbox', { name: 'Dark' })
    await user.click(checkbox)
    expect(setTheme.mock.calls).toEqual([[testCase.new]])
  })
})

test('logs out', async () => {
  const user = userEvent.setup()
  const logout = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <Nav
        isAdmin={true}
        logout={logout}
        navigateIf={dontNavigate}
        searchBeerIf={dontSearchBeer}
        searchBreweryIf={dontSearchBrewery}
        searchIf={noSearch}
        setTheme={dontCall}
        theme={Theme.DARK}
      />
    </LinkWrapper>
  )
  const moreButton = getByRole('button', { name: 'More' })
  await user.click(moreButton)
  const logoutButton = getByRole('button', { name: 'Logout' })
  await user.click(logoutButton)
  expect(logout.mock.calls).toEqual([[]])
})

test('do not show admin features to viewer', async () => {
  const user = userEvent.setup()
  const logout = vitest.fn()
  const { getByRole, queryByRole } = render(
    <LinkWrapper>
      <Nav
        isAdmin={false}
        logout={logout}
        navigateIf={dontNavigate}
        searchBeerIf={dontSearchBeer}
        searchBreweryIf={dontSearchBrewery}
        searchIf={noSearch}
        setTheme={dontCall}
        theme={Theme.DARK}
      />
    </LinkWrapper>
  )
  const moreButton = getByRole('button', { name: 'More' })
  await user.click(moreButton)

  const addReviewLink = queryByRole('link', { name: 'Add review' })
  expect(addReviewLink).toEqual(null)

  const usersLink = queryByRole('link', { name: 'Users' })
  expect(usersLink).toEqual(null)
})

test('searches beer', async () => {
  const user = userEvent.setup()
  const navigate = vitest.fn()
  const { getByRole, getByPlaceholderText } = render(
    <LinkWrapper>
      <Nav
        isAdmin={false}
        logout={dontCall}
        navigateIf={{
          useNavigate: () => navigate
        }}
        searchBeerIf={{
          useSearch: () => ({
            search: async () => beers,
            isLoading: false
          })
        }}
        searchBreweryIf={dontSearchBrewery}
        searchIf={activeSearch}
        setTheme={dontCall}
        theme={Theme.DARK}
      />
    </LinkWrapper>
  )
  const moreButton = getByRole('button', { name: 'More' })
  await user.click(moreButton)

  const input = getByPlaceholderText('Search beer')
  expect(input).toBeDefined()
  await user.type(input, 'Do')

  const itemButton = getByRole(
    'button',
    { name: `${beer.name} (${brewery.name})` }
  )
  await user.click(itemButton)
  expect(navigate.mock.calls).toEqual([[`/beers/${beer.id}`]])
})

test('searches brewery', async () => {
  const user = userEvent.setup()
  const navigate = vitest.fn()
  const { getByRole, getByPlaceholderText } = render(
    <LinkWrapper>
      <Nav
        isAdmin={false}
        logout={dontCall}
        navigateIf={{
          useNavigate: () => navigate
        }}
        searchBeerIf={dontSearchBeer}
        searchBreweryIf={{
          useSearch: () => ({
            search: async () => [brewery],
            isLoading: false
          })
        }}
        searchIf={activeSearch}
        setTheme={dontCall}
        theme={Theme.DARK}
      />
    </LinkWrapper>
  )
  const moreButton = getByRole('button', { name: 'More' })
  await user.click(moreButton)

  const input = getByPlaceholderText('Search brewery')
  expect(input).toBeDefined()
  await user.type(input, 'Lehe')

  const itemButton = getByRole(
    'button',
    { name: brewery.name }
  )
  await user.click(itemButton)
  expect(navigate.mock.calls).toEqual([[`/breweries/${brewery.id}`]])
})
