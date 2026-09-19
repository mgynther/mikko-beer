import { useState } from 'react'
import { Link as RouterLink, MemoryRouter, useParams } from 'react-router'

import { render } from '@testing-library/react'
import { setupUser } from '../../test-util/user-event'
import { expect, test, vitest } from 'vitest'
import { testTimes } from '../../test-util/filter-time'
import { dontCall } from '../../test-util/dont-call'

import App from './App'
import type { StoreIf } from '../components/types/storeIf'
import type { LinkComponent } from '../components/common/link'
import { Role } from '../components/types/user/types'
import type { GetLogin } from '../components/types/login/types'
import type {
  InfiniteScroll,
  NavMenuIf,
  NavMenuState,
  NavigateIf,
  Theme,
  UseUrlPathParams,
  ThemeIf,
  UseDebounce,
  UseUrlSearchParams,
  YearMonth,
} from '../components/types/types'
import type { DeleteStorageIf } from '../components/types/storage/types'
import type { SearchBeerIf, SelectBeerIf } from '../components/types/beer/types'
import type { SearchBreweryIf } from '../components/types/brewery/types'
import type { SearchLocationIf } from '../components/types/location/types'
import type { ListStylesIf } from '../components/types/style/types'
import type {
  ListFilterIf,
  ReviewContainerIf,
  ReviewIf,
  SetSearch,
} from '../components/types/review/types'
import type { SearchFieldIf } from '../components/types/search/types'

const navMenuIf: NavMenuIf = {
  useNavMenu: () => {
    const [navMenuState, setNavMenuState] = useState<NavMenuState>('COLLAPSED')
    return { navMenuState, setNavMenuState }
  },
}

const themeIf: ThemeIf = {
  useTheme: () => {
    const [theme, setTheme] = useState<Theme>('LIGHT')
    return { theme, setTheme }
  },
}

// The routing layer's implementations of interfaces app may not import. The
// route table is what these tests are about, so the links have to route.
const linkComponent: LinkComponent = (props) => (
  <RouterLink to={props.to}>{props.text}</RouterLink>
)

// The same for the url parameters: a fake that returned nothing would stop the
// detail routes from finding their ids.
const useUrlPathParams: UseUrlPathParams = () => useParams()

const navigateIf: NavigateIf = {
  useNavigate: () => () => undefined,
}

const infiniteScroll: InfiniteScroll = () => () => undefined

const useDebounce: UseDebounce<string> = (str) => [str, false]
const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

const getUndefinedLogin: GetLogin = () => ({
  user: undefined,
  authToken: '',
  refreshToken: '',
})

const getAdminLogin: GetLogin = () => ({
  user: {
    id: '98e1693b-cd1d-46e7-a738-db8f089a5244',
    username: 'admin',
    role: Role.admin,
  },
  authToken: 'auth',
  refreshToken: 'refresh',
})

const searchFieldIf: SearchFieldIf = {
  useSearchField: () => ({
    activate: dontCall,
    isActive: false,
  }),
  useDebounce,
}

const searchBeerIf: SearchBeerIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false,
  }),
  searchFieldIf,
}

const searchBreweryIf: SearchBreweryIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false,
  }),
  searchFieldIf,
}

const searchLocationIf: SearchLocationIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false,
  }),
  create: {
    useCreate: () => ({
      create: dontCall,
      isLoading: false,
    }),
  },
  searchFieldIf,
}

const listStylesIf: ListStylesIf = {
  useList: () => ({
    styles: [],
    isLoading: false,
  }),
  searchFieldIf,
}

const selectBeerIf: SelectBeerIf = {
  create: {
    useCreate: () => ({
      create: dontCall,
      isLoading: false,
    }),
    editBeerIf: {
      selectBreweryIf: {
        create: {
          useCreate: dontCall,
        },
        search: searchBreweryIf,
      },
      selectStyleIf: {
        create: {
          useCreate: dontCall,
        },
        list: listStylesIf,
      },
    },
  },
  search: searchBeerIf,
}

const reviewContainerIf: ReviewContainerIf = {
  createIf: {
    useCreate: dontCall,
  },
  listIf: {
    useList: () => ({
      data: undefined,
      isLoading: false,
    }),
  },
}

const deleteStorageIf: DeleteStorageIf = {
  useDelete: () => ({
    delete: dontCall,
  }),
  getLogin: getUndefinedLogin,
}

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const useUrlSearchParams: UseUrlSearchParams = () => ({
  get: (): undefined => undefined,
})

const listFilterIf: (setSearch: SetSearch) => ListFilterIf = (
  setSearch: SetSearch,
) => ({
  getUseDebounce,
  minTime,
  maxTime,
  setSearch,
  useUrlSearchParams,
})

const reviewIf: ReviewIf = {
  get: {
    useGet: dontCall,
  },
  update: {
    useUpdate: dontCall,
    searchLocationIf,
    selectBeerIf,
    reviewContainerIf,
  },
  getLogin: getUndefinedLogin,
}

const storeIf: StoreIf = {
  navMenuIf,
  themeIf,
  getLogin: getUndefinedLogin,
  getBeerIf: {
    useGetBeer: dontCall,
  },
  listBeersIf: {
    useList: () => ({
      list: async () => ({
        beers: [],
      }),
      beerList: {
        beers: [],
      },
      isLoading: false,
      isUninitialized: false,
    }),
    infiniteScroll,
  },
  searchBeerIf,
  selectBeerIf,
  updateBeerLoginIf: {
    useUpdate: dontCall,
    editBeerIf: {
      selectBreweryIf: {
        create: {
          useCreate: dontCall,
        },
        search: {
          useSearch: dontCall,
          searchFieldIf: {
            useSearchField: dontCall,
            useDebounce: dontCall,
          },
        },
      },
      selectStyleIf: {
        create: {
          useCreate: dontCall,
        },
        list: listStylesIf,
      },
    },
    getLogin: getUndefinedLogin,
  },
  getBreweryIf: {
    useGet: dontCall,
  },
  listBreweriesIf: {
    useList: () => ({
      list: dontCall,
      breweryList: undefined,
      isLoading: false,
      isUninitialized: false,
    }),
    infiniteScroll,
  },
  searchBreweryIf,
  updateBreweryIf: {
    useUpdate: dontCall,
    getLogin: getUndefinedLogin,
  },
  listContainersIf: {
    useList: () => ({
      data: undefined,
      isLoading: false,
    }),
  },
  reviewContainerIf,
  updateContainerIf: {
    useUpdate: dontCall,
    getLogin: getUndefinedLogin,
  },
  getLocationIf: {
    useGet: dontCall,
  },
  listLocationsIf: {
    useList: () => ({
      list: dontCall,
      locationList: undefined,
      isLoading: false,
      isUninitialized: false,
    }),
    infiniteScroll,
  },
  searchLocationIf,
  updateLocationIf: {
    useUpdate: dontCall,
    getLogin: getAdminLogin,
  },
  changePasswordIf: {
    useChangePassword: () => ({
      changePassword: dontCall,
      isLoading: false,
    }),
    useGetPasswordChangeResult: () => ({
      getResult: () => 'UNDEFINED',
    }),
    getLogin: getAdminLogin,
  },
  loginIf: {
    useLogin: () => ({
      login: dontCall,
      isLoading: false,
    }),
  },
  logoutIf: {
    useLogout: () => ({
      logout: dontCall,
    }),
  },
  createReviewIf: {
    useCreate: () => ({
      create: dontCall,
      isLoading: false,
      isSuccess: false,
      review: undefined,
    }),
    getCurrentDate: () => new Date('2024-10-10'),
    searchLocationIf,
    selectBeerIf,
    reviewContainerIf,
  },
  listReviewsIf: {
    useList: () => ({
      list: dontCall,
      reviewList: undefined,
      isLoading: false,
      isUninitialized: false,
    }),
    infiniteScroll,
    filterIf: listFilterIf(() => undefined),
  },
  listReviewsByBeerIf: {
    useList: dontCall,
    filterIf: listFilterIf(dontCall),
    reviewIf,
  },
  listReviewsByBreweryIf: {
    useList: dontCall,
    filterIf: listFilterIf(dontCall),
    reviewIf,
  },
  listReviewsByLocationIf: {
    useList: dontCall,
    filterIf: listFilterIf(dontCall),
    reviewIf,
  },
  listReviewsByStyleIf: {
    useList: dontCall,
    filterIf: listFilterIf(dontCall),
    reviewIf,
  },
  reviewIf,
  statsIf: {
    annual: {
      useStats: () => ({
        stats: undefined,
        isLoading: false,
      }),
    },
    annualContainer: {
      useStats: dontCall,
      infiniteScroll,
    },
    brewery: {
      useStats: dontCall,
      infiniteScroll,
      minTime,
      maxTime,
      getUseDebounce,
    },
    breweryCountry: {
      useStats: dontCall,
      infiniteScroll,
      minTime,
      maxTime,
      getUseDebounce,
    },
    container: {
      useStats: dontCall,
    },
    location: {
      useStats: dontCall,
      infiniteScroll,
      minTime,
      maxTime,
      getUseDebounce,
    },
    overall: {
      useStats: () => ({
        stats: undefined,
        isLoading: false,
      }),
    },
    rating: {
      useStats: dontCall,
    },
    style: {
      useStats: dontCall,
      minTime,
      maxTime,
      getUseDebounce,
    },
    setSearch: async () => undefined,
    useUrlSearchParams,
  },
  searchFieldIf: {
    useSearchField: () => ({
      activate: dontCall,
      isActive: false,
    }),
    useDebounce,
  },
  createStorageIf: {
    useCreate: () => ({
      create: dontCall,
      hasError: false,
      isLoading: false,
    }),
  },
  getStorageIf: {
    useGet: dontCall,
  },
  listStoragesIf: {
    useList: () => ({
      storages: undefined,
      isLoading: false,
    }),
    delete: deleteStorageIf,
  },
  listStoragesByBeerIf: {
    useList: dontCall,
    delete: deleteStorageIf,
  },
  listStoragesByBreweryIf: {
    useList: dontCall,
    delete: deleteStorageIf,
  },
  listStoragesByStyleIf: {
    useList: dontCall,
    delete: deleteStorageIf,
  },
  storageStatsIf: {
    annual: {
      useAnnualStats: () => ({
        stats: undefined,
        isLoading: true,
      }),
    },
    monthly: {
      useMonthlyStats: dontCall,
    },
    setSearch: async () => undefined,
    useUrlSearchParams,
  },
  getStyleIf: {
    useGet: dontCall,
  },
  listStylesIf,
  updateStyleIf: {
    useUpdate: dontCall,
    getLogin: getUndefinedLogin,
  },
  userIf: {
    create: {
      useCreate: () => ({
        create: dontCall,
        user: undefined,
        hasError: false,
        isLoading: false,
      }),
    },
    list: {
      useList: () => ({
        data: undefined,
        isLoading: false,
      }),
    },
    delete: {
      useDelete: () => ({
        delete: dontCall,
      }),
    },
  },
}

test('renders app login', () => {
  const { getByRole } = render(
    <MemoryRouter>
      <App
        linkComponent={linkComponent}
        navigateIf={navigateIf}
        storeIf={storeIf}
        useUrlPathParams={useUrlPathParams}
      />
    </MemoryRouter>,
  )
  const loginButton = getByRole('button', { name: 'Login' })
  expect(loginButton).toBeDefined()
})

test('navigates to Beers', async () => {
  const user = setupUser()
  const { getByRole } = render(
    <MemoryRouter>
      <App
        linkComponent={linkComponent}
        navigateIf={navigateIf}
        storeIf={{
          ...storeIf,
          getLogin: getAdminLogin,
        }}
        useUrlPathParams={useUrlPathParams}
      />
    </MemoryRouter>,
  )
  const addReviewLink = getByRole('link', { name: 'Add review' })
  await user.click(addReviewLink)
  getByRole('heading', { name: 'Add review' })

  const beersLink = getByRole('link', { name: 'Beers' })
  await user.click(beersLink)
  getByRole('heading', { name: 'Beers' })
})

interface NavigationTest {
  linkText: string
  heading: string
}

const navigationTests: NavigationTest[] = [
  {
    linkText: 'Add review',
    heading: 'Add review',
  },
  {
    linkText: 'Breweries',
    heading: 'Breweries',
  },
  {
    linkText: 'Reviews',
    heading: 'Reviews',
  },
  {
    linkText: 'Statistics',
    heading: 'Statistics',
  },
  {
    linkText: 'Storage',
    heading: 'Storage beers',
  },
]

navigationTests.forEach((testCase) => {
  test(`navigates to ${testCase.heading}`, async () => {
    const user = setupUser()
    const { getByRole } = render(
      <MemoryRouter>
        <App
          linkComponent={linkComponent}
          navigateIf={navigateIf}
          storeIf={{
            ...storeIf,
            getLogin: getAdminLogin,
          }}
          useUrlPathParams={useUrlPathParams}
        />
      </MemoryRouter>,
    )
    const link = getByRole('link', { name: testCase.linkText })
    await user.click(link)
    getByRole('heading', { name: testCase.heading })
  })
})

const navigationMoreTests: NavigationTest[] = [
  {
    linkText: 'Styles',
    heading: 'Styles',
  },
  {
    linkText: 'Containers',
    heading: 'Containers',
  },
  {
    linkText: 'Locations',
    heading: 'Locations',
  },
  {
    linkText: 'Users',
    heading: 'Users',
  },
  {
    linkText: 'Account',
    heading: 'Account',
  },
]

navigationMoreTests.forEach((testCase) => {
  test(`navigates to ${testCase.heading}`, async () => {
    const user = setupUser()
    const { getByRole } = render(
      <MemoryRouter>
        <App
          linkComponent={linkComponent}
          navigateIf={navigateIf}
          storeIf={{
            ...storeIf,
            getLogin: getAdminLogin,
          }}
          useUrlPathParams={useUrlPathParams}
        />
      </MemoryRouter>,
    )
    const moreButton = getByRole('button', { name: 'More' })
    await user.click(moreButton)

    const link = getByRole('link', { name: testCase.linkText })
    await user.click(link)
    getByRole('heading', { name: testCase.heading })
  })
})

test('loads annual stats directly', async () => {
  const user = setupUser()
  const data: Record<string, string> = { stats: 'annual' }
  const useUrlSearchParams: UseUrlSearchParams = () => ({
    get: (name: string) => data[name],
  })
  const { getByRole, getByText } = render(
    <MemoryRouter>
      <App
        linkComponent={linkComponent}
        navigateIf={navigateIf}
        storeIf={{
          ...storeIf,
          statsIf: {
            ...storeIf.statsIf,
            useUrlSearchParams,
          },
          getLogin: getAdminLogin,
        }}
        useUrlPathParams={useUrlPathParams}
      />
    </MemoryRouter>,
  )
  const link = getByRole('link', { name: 'Statistics' })
  await user.click(link)
  getByText('Year')
})

test('sets theme to dark', async () => {
  const user = setupUser()
  const { getByRole } = render(
    <MemoryRouter>
      <App
        linkComponent={linkComponent}
        navigateIf={navigateIf}
        storeIf={{
          ...storeIf,
          getLogin: getAdminLogin,
        }}
        useUrlPathParams={useUrlPathParams}
      />
    </MemoryRouter>,
  )
  const moreButton = getByRole('button', { name: 'More' })
  await user.click(moreButton)

  const bodyLight = document.getElementsByTagName('body')
  expect(bodyLight[0].getAttribute('class')).toEqual('light')

  const darkCheckbox = getByRole('checkbox', { name: 'Dark' })
  await user.click(darkCheckbox)
  const bodyDark = document.getElementsByTagName('body')
  expect(bodyDark[0].getAttribute('class')).toEqual(null)
})

test('logout', async () => {
  const user = setupUser()
  const logout = vitest.fn()
  const { getByRole } = render(
    <MemoryRouter>
      <App
        linkComponent={linkComponent}
        navigateIf={navigateIf}
        storeIf={{
          ...storeIf,
          getLogin: getAdminLogin,
          logoutIf: {
            useLogout: () => ({
              logout,
            }),
          },
        }}
        useUrlPathParams={useUrlPathParams}
      />
    </MemoryRouter>,
  )
  const moreButton = getByRole('button', { name: 'More' })
  await user.click(moreButton)

  const logoutButton = getByRole('button', { name: 'Logout' })
  await user.click(logoutButton)

  expect(logout).toHaveBeenCalledTimes(1)
})
