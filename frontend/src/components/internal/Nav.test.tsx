import { render } from '@testing-library/react'
import { setupUser } from '../../../test-util/user-event'
import { expect, test, vitest } from 'vitest'

import Nav from './Nav'

import type { SearchBeerIf } from '../types/beer/types'
import type { SearchFieldIf } from '../types/search/types'
import type { SearchBreweryIf } from '../types/brewery/types'
import type {
  NavMenu,
  NavMenuState,
  NavigateIf,
  Theme,
  ThemeSelection,
  UseDebounce,
} from '../types/types'
import { dontCall } from '../../../test-util/dont-call'
import { testLink } from '../../../test-util/link'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const noSearch: SearchFieldIf = {
  useSearchField: () => ({
    activate: dontCall,
    isActive: false,
  }),
  useDebounce,
}

const dontSearchBeer: SearchBeerIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false,
  }),
  searchFieldIf: noSearch,
}

const activeSearch: SearchFieldIf = {
  useSearchField: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
}

const dontSearchBrewery: SearchBreweryIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false,
  }),
  searchFieldIf: noSearch,
}

const dontNavigate: NavigateIf = {
  useNavigate: () => dontCall,
}

const brewery = {
  id: '60338d36-4f67-47bd-9cac-9fe2b26132f5',
  name: 'Lehe Pruulikoda',
  country: undefined,
}

const breweries = [brewery]

const styles = [
  {
    id: 'e7263c85-d38e-429d-8019-b5b9d61da570',
    name: 'Sour',
  },
]

const beer = {
  id: '3b494ad4-da2b-478a-9abf-82fade8dfc36',
  name: 'Doomino efekt',
  breweries,
  styles,
}

const anotherBeer = {
  id: 'b8738024-5f0a-4c74-aed1-b4d42bed9bdf',
  name: 'Incubus',
  breweries,
  styles,
}

const beers = [beer, anotherBeer]

const defaultNavMenu: NavMenu = {
  setNavMenuState: dontCall,
  navMenuState: 'COLLAPSED',
}

const expandedNavMenu: NavMenu = {
  setNavMenuState: dontCall,
  navMenuState: 'EXPANDED',
}

const defaultThemeSelection: ThemeSelection = {
  setTheme: dontCall,
  theme: 'DARK',
}

interface NavigationTest {
  linkText: string
  pathname: string
}

const navigationTests: NavigationTest[] = [
  {
    linkText: 'Add review',
    pathname: '/addreview',
  },
  {
    linkText: 'Beers',
    pathname: '/beers',
  },
  {
    linkText: 'Breweries',
    pathname: '/breweries',
  },
  {
    linkText: 'Reviews',
    pathname: '/reviews',
  },
  {
    linkText: 'Statistics',
    pathname: '/stats',
  },
  {
    linkText: 'Storage',
    pathname: '/storage',
  },
]

navigationTests.forEach((testCase) => {
  test(`navigates to ${testCase.pathname}`, async () => {
    const { getByRole } = render(
      <Nav
        linkComponent={testLink}
        isAdmin={true}
        logout={undefined}
        navMenu={defaultNavMenu}
        navigateIf={dontNavigate}
        searchBeerIf={dontSearchBeer}
        searchBreweryIf={dontSearchBrewery}
        theme={defaultThemeSelection}
      />,
    )
    const link = getByRole('link', { name: testCase.linkText })
    expect(link.getAttribute('href')).toEqual(testCase.pathname)
  })
})

const navigationMoreTests: NavigationTest[] = [
  {
    linkText: 'Styles',
    pathname: '/styles',
  },
  {
    linkText: 'Containers',
    pathname: '/containers',
  },
  {
    linkText: 'Users',
    pathname: '/users',
  },
  {
    linkText: 'Account',
    pathname: '/account',
  },
]

navigationMoreTests.forEach((testCase) => {
  test(`navigates to ${testCase.pathname}`, async () => {
    const { getByRole } = render(
      <Nav
        linkComponent={testLink}
        isAdmin={true}
        logout={dontCall}
        navMenu={expandedNavMenu}
        navigateIf={dontNavigate}
        searchBeerIf={dontSearchBeer}
        searchBreweryIf={dontSearchBrewery}
        theme={defaultThemeSelection}
      />,
    )
    const link = getByRole('link', { name: testCase.linkText })
    expect(link.getAttribute('href')).toEqual(testCase.pathname)
  })
})

navigationMoreTests.forEach((testCase) => {
  test(`do not find ${testCase.pathname} without more open`, async () => {
    const { queryByRole } = render(
      <Nav
        linkComponent={testLink}
        isAdmin={true}
        logout={dontCall}
        navMenu={defaultNavMenu}
        navigateIf={dontNavigate}
        searchBeerIf={dontSearchBeer}
        searchBreweryIf={dontSearchBrewery}
        theme={defaultThemeSelection}
      />,
    )
    const link = queryByRole('link', { name: testCase.linkText })
    expect(link).toEqual(null)
  })
})

test('do not find text fields without more open', async () => {
  const { queryByRole } = render(
    <Nav
      linkComponent={testLink}
      isAdmin={true}
      logout={dontCall}
      navMenu={defaultNavMenu}
      navigateIf={dontNavigate}
      searchBeerIf={dontSearchBeer}
      searchBreweryIf={dontSearchBrewery}
      theme={defaultThemeSelection}
    />,
  )
  const fields = queryByRole('textfield')
  expect(fields).toEqual(null)
})

interface ThemeTest {
  original: Theme
  new: Theme
}

const themeTests: ThemeTest[] = [
  {
    original: 'DARK',
    new: 'LIGHT',
  },
  {
    original: 'LIGHT',
    new: 'DARK',
  },
]

themeTests.forEach((testCase) => {
  test(`set theme from ${testCase.original} to ${testCase.new} `, async () => {
    const user = setupUser()
    const setTheme = vitest.fn()
    const { getByRole } = render(
      <Nav
        linkComponent={testLink}
        isAdmin={true}
        logout={dontCall}
        navMenu={expandedNavMenu}
        navigateIf={dontNavigate}
        searchBeerIf={dontSearchBeer}
        searchBreweryIf={dontSearchBrewery}
        theme={{
          setTheme: setTheme,
          theme: testCase.original,
        }}
      />,
    )
    const checkbox = getByRole('checkbox', { name: 'Dark' })
    await user.click(checkbox)
    expect(setTheme.mock.calls).toEqual([[testCase.new]])
  })
})

test('logs out', async () => {
  const user = setupUser()
  const logout = vitest.fn()
  const { getByRole } = render(
    <Nav
      linkComponent={testLink}
      isAdmin={true}
      logout={logout}
      navMenu={expandedNavMenu}
      navigateIf={dontNavigate}
      searchBeerIf={dontSearchBeer}
      searchBreweryIf={dontSearchBrewery}
      theme={defaultThemeSelection}
    />,
  )
  const logoutButton = getByRole('button', { name: 'Logout' })
  await user.click(logoutButton)
  expect(logout.mock.calls).toEqual([[]])
})

test('do not show admin features to viewer', async () => {
  const logout = vitest.fn()
  const { queryByRole } = render(
    <Nav
      linkComponent={testLink}
      isAdmin={false}
      logout={logout}
      navMenu={expandedNavMenu}
      navigateIf={dontNavigate}
      searchBeerIf={dontSearchBeer}
      searchBreweryIf={dontSearchBrewery}
      theme={defaultThemeSelection}
    />,
  )

  const addReviewLink = queryByRole('link', { name: 'Add review' })
  expect(addReviewLink).toEqual(null)

  const usersLink = queryByRole('link', { name: 'Users' })
  expect(usersLink).toEqual(null)
})

test('searches beer', async () => {
  const user = setupUser()
  const navigate = vitest.fn()
  const searchBeerIf: SearchBeerIf = {
    useSearch: () => ({
      search: async () => beers,
      isLoading: false,
    }),
    searchFieldIf: activeSearch,
  }
  const { getByRole, getByPlaceholderText } = render(
    <Nav
      linkComponent={testLink}
      isAdmin={false}
      logout={dontCall}
      navMenu={expandedNavMenu}
      navigateIf={{
        useNavigate: () => navigate,
      }}
      searchBeerIf={searchBeerIf}
      searchBreweryIf={dontSearchBrewery}
      theme={defaultThemeSelection}
    />,
  )

  const input = getByPlaceholderText('Search beer')
  expect(input).toBeDefined()
  await user.type(input, 'Do')

  const itemButton = getByRole('button', {
    name: `${beer.name} (${brewery.name})`,
  })
  await user.click(itemButton)
  expect(navigate.mock.calls).toEqual([[`/beers/${beer.id}`]])
})

test('searches brewery', async () => {
  const user = setupUser()
  const navigate = vitest.fn()
  const searchBreweryIf: SearchBreweryIf = {
    useSearch: () => ({
      search: async () => [brewery],
      isLoading: false,
    }),
    searchFieldIf: activeSearch,
  }
  const { getByRole, getByPlaceholderText } = render(
    <Nav
      linkComponent={testLink}
      isAdmin={false}
      logout={dontCall}
      navMenu={expandedNavMenu}
      navigateIf={{
        useNavigate: () => navigate,
      }}
      searchBeerIf={dontSearchBeer}
      searchBreweryIf={searchBreweryIf}
      theme={defaultThemeSelection}
    />,
  )

  const input = getByPlaceholderText('Search brewery')
  expect(input).toBeDefined()
  await user.type(input, 'Lehe')

  const itemButton = getByRole('button', { name: brewery.name })
  await user.click(itemButton)
  expect(navigate.mock.calls).toEqual([[`/breweries/${brewery.id}`]])
})

interface NavStateTest {
  original: NavMenuState
  new: NavMenuState
  buttonText: string
}

const navStateTests: NavStateTest[] = [
  {
    original: 'COLLAPSED',
    new: 'EXPANDED',
    buttonText: 'More',
  },
  {
    original: 'EXPANDED',
    new: 'COLLAPSED',
    buttonText: 'Less',
  },
]

navStateTests.forEach((testCase) => {
  // prettier-ignore
  test(`set nav state from ${
    testCase.original
  } to ${
    testCase.new
  }`, async () => {
    const user = setupUser()
    const setNavState = vitest.fn()
    const { getByRole } = render(
        <Nav linkComponent={testLink}
          isAdmin={true}
          logout={undefined}
          navMenu={{
            setNavMenuState: setNavState,
            navMenuState: testCase.original,
          }}
          navigateIf={dontNavigate}
          searchBeerIf={dontSearchBeer}
          searchBreweryIf={dontSearchBrewery}
          theme={defaultThemeSelection}
        />
    )
    const button = getByRole('button', { name: testCase.buttonText })
    await user.click(button)
    expect(setNavState.mock.calls).toEqual([[testCase.new]])
  })
})
