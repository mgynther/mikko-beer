import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import LinkWrapper from './components/LinkWrapper'

import Nav from './Nav'
import type { NavMenuStateProps, ThemeProps } from './Nav'
import type { SearchBeerIf } from './core/beer/types'
import type { SearchIf } from './core/search/types'
import type { SearchBreweryIf } from './core/brewery/types'
import type { NavigateIf } from './components/util'
import type { NavMenuState, Theme, UseDebounce } from './core/types'

const useDebounce: UseDebounce<string> = str => [str, false]

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

const defaultNavStateProps: NavMenuStateProps = {
  setNavMenuState: dontCall,
  navMenuState: 'COLLAPSED'
}

const expandedNavStateProps: NavMenuStateProps = {
  setNavMenuState: dontCall,
  navMenuState: 'EXPANDED'
}

const defaultThemeProps: ThemeProps = {
  setTheme: dontCall,
  theme: 'DARK'
}

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
          navMenuState={defaultNavStateProps}
          navigateIf={dontNavigate}
          searchBeerIf={dontSearchBeer}
          searchBreweryIf={dontSearchBrewery}
          searchIf={noSearch}
          theme={defaultThemeProps}
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
          navMenuState={expandedNavStateProps}
          navigateIf={dontNavigate}
          searchBeerIf={dontSearchBeer}
          searchBreweryIf={dontSearchBrewery}
          searchIf={noSearch}
          theme={defaultThemeProps}
        />
      </LinkWrapper>
    )
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
          navMenuState={defaultNavStateProps}
          navigateIf={dontNavigate}
          searchBeerIf={dontSearchBeer}
          searchBreweryIf={dontSearchBrewery}
          searchIf={noSearch}
          theme={defaultThemeProps}
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
        navMenuState={defaultNavStateProps}
        navigateIf={dontNavigate}
        searchBeerIf={dontSearchBeer}
        searchBreweryIf={dontSearchBrewery}
        searchIf={noSearch}
        theme={defaultThemeProps}
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
    original: 'DARK',
    new: 'LIGHT'
  },
  {
    original: 'LIGHT',
    new: 'DARK'
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
          navMenuState={expandedNavStateProps}
          navigateIf={dontNavigate}
          searchBeerIf={dontSearchBeer}
          searchBreweryIf={dontSearchBrewery}
          searchIf={noSearch}
          theme={{
            setTheme: setTheme,
            theme: testCase.original
          }}
        />
      </LinkWrapper>
    )
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
        navMenuState={expandedNavStateProps}
        navigateIf={dontNavigate}
        searchBeerIf={dontSearchBeer}
        searchBreweryIf={dontSearchBrewery}
        searchIf={noSearch}
        theme={defaultThemeProps}
      />
    </LinkWrapper>
  )
  const logoutButton = getByRole('button', { name: 'Logout' })
  await user.click(logoutButton)
  expect(logout.mock.calls).toEqual([[]])
})

test('do not show admin features to viewer', async () => {
  const logout = vitest.fn()
  const { queryByRole } = render(
    <LinkWrapper>
      <Nav
        isAdmin={false}
        logout={logout}
        navMenuState={expandedNavStateProps}
        navigateIf={dontNavigate}
        searchBeerIf={dontSearchBeer}
        searchBreweryIf={dontSearchBrewery}
        searchIf={noSearch}
        theme={defaultThemeProps}
      />
    </LinkWrapper>
  )

  const addReviewLink = queryByRole('link', { name: 'Add review' })
  expect(addReviewLink).toEqual(null)

  const usersLink = queryByRole('link', { name: 'Users' })
  expect(usersLink).toEqual(null)
})

test('searches beer', async () => {
  const user = userEvent.setup()
  const navigate = vitest.fn()
  const searchBeerIf: SearchBeerIf = {
    useSearch: () => ({
      search: async () => beers,
        isLoading: false
    })
  }
  const { getByRole, getByPlaceholderText } = render(
    <LinkWrapper>
      <Nav
        isAdmin={false}
        logout={dontCall}
        navMenuState={expandedNavStateProps}
        navigateIf={{
          useNavigate: () => navigate
        }}
        searchBeerIf={searchBeerIf}
        searchBreweryIf={dontSearchBrewery}
        searchIf={activeSearch}
        theme={defaultThemeProps}
      />
    </LinkWrapper>
  )

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
  const searchBreweryIf: SearchBreweryIf = {
    useSearch: () => ({
      search: async () => [brewery],
        isLoading: false
    })
  }
  const { getByRole, getByPlaceholderText } = render(
    <LinkWrapper>
      <Nav
        isAdmin={false}
        logout={dontCall}
        navMenuState={expandedNavStateProps}
        navigateIf={{
          useNavigate: () => navigate
        }}
        searchBeerIf={dontSearchBeer}
        searchBreweryIf={searchBreweryIf}
        searchIf={activeSearch}
        theme={defaultThemeProps}
      />
    </LinkWrapper>
  )

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

interface NavStateTest {
  original: NavMenuState,
  new: NavMenuState,
  buttonText: string
}

const navStateTests: NavStateTest[] = [
  {
    original: 'COLLAPSED',
    new: 'EXPANDED',
    buttonText: 'More'
  },
  {
    original: 'EXPANDED',
    new: 'COLLAPSED',
    buttonText: 'Less'
  }
]

navStateTests.forEach(testCase => {
  test(`set nav state from ${testCase.original} to ${testCase.new}`,
    async () => {
      const user = userEvent.setup()
      const setNavState = vitest.fn()
      const { getByRole } = render(
        <LinkWrapper>
          <Nav
            isAdmin={true}
            logout={dontCall}
            navMenuState={{
              setNavMenuState: setNavState,
              navMenuState: testCase.original
            }}
            navigateIf={dontNavigate}
            searchBeerIf={dontSearchBeer}
            searchBreweryIf={dontSearchBrewery}
            searchIf={noSearch}
            theme={defaultThemeProps}
          />
        </LinkWrapper>
      )
      const button = getByRole('button', { name: testCase.buttonText })
      await user.click(button)
      expect(setNavState.mock.calls)
        .toEqual([[testCase.new]])
    })
})
