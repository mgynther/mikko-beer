import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import LinkWrapper from './components/LinkWrapper'

import { Provider } from './react-redux-wrapper'
import App from './App'
import { store } from './store/store'
import type { StoreIf } from './store/storeIf'
import { Role } from './core/user/types'
import { type GetLogin, PasswordChangeResult } from './core/login/types'
import type { UseDebounce } from './core/types'
import type { DeleteStorageIf } from './core/storage/types'
import { paramsIf } from './components/util'
import type { ParamsIf } from './components/util'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const infiniteScroll = () => () => undefined

const useDebounce: UseDebounce = str => str

const getUndefinedLogin: GetLogin = () => ({
  user: undefined,
  authToken: '',
  refreshToken: ''
})

const getAdminLogin: GetLogin = () => ({
  user: {
    id: '98e1693b-cd1d-46e7-a738-db8f089a5244',
    username: 'admin',
    role: Role.admin
  },
  authToken: 'auth',
  refreshToken: 'refresh'
})

const searchBeerIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false
  })
}

const searchBreweryIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false
  })
}

const listStylesIf = {
  useList: () => ({
    styles: [],
    isLoading: false
  })
}

const selectBeerIf = {
  create: {
    useCreate: () => ({
      create: dontCall,
      isLoading: false
    }),
    editBeerIf: {
      selectBreweryIf: {
        create: {
          useCreate: dontCall
        },
        search: searchBreweryIf
      },
      selectStyleIf: {
        create: {
          useCreate: dontCall
        },
        list: listStylesIf
      }
    }
  },
  search: searchBeerIf
}

const reviewContainerIf = {
  createIf: {
    useCreate: dontCall
  },
  listIf: {
    useList: () => ({
      data: undefined,
      isLoading: false
    })
  }
}

const deleteStorageIf: DeleteStorageIf = {
  useDelete: () => ({
    delete: dontCall
  })
}

const storeIf: StoreIf = {
  getLogin: getUndefinedLogin,
  getBeerIf: {
    useGetBeer: dontCall
  },
  listBeersIf: {
    useList: () => ({
      list: async () => ({
        beers: []
      }),
      beerList: {
        beers: []
      },
      isLoading: false,
      isUninitialized: false
    }),
    infiniteScroll
  },
  searchBeerIf,
  selectBeerIf,
  updateBeerIf: {
    useUpdate: dontCall,
    editBeerIf: {
      selectBreweryIf: {
        create: {
          useCreate: dontCall
        },
        search: {
          useSearch: dontCall
        }
      },
      selectStyleIf: {
        create: {
          useCreate: dontCall
        },
        list: listStylesIf
      }
    }
  },
  getBreweryIf: {
    useGet: dontCall
  },
  listBreweriesIf: {
    useList: () => ({
      list: dontCall,
      breweryList: undefined,
      isLoading: false,
      isUninitialized: false
    }),
    infiniteScroll
  },
  searchBreweryIf,
  updateBreweryIf: {
    useUpdate: dontCall
  },
  listContainersIf: {
    useList: () => ({
      data: undefined,
      isLoading: false
    })
  },
  reviewContainerIf,
  updateContainerIf: {
    useUpdate: dontCall
  },
  changePasswordIf: {
    useChangePassword: () => ({
      changePassword: dontCall,
      isLoading: false
    }),
    useGetPasswordChangeResult: () => ({
      getResult: () => PasswordChangeResult.UNDEFINED
    })
  },
  loginIf: {
    useLogin: () => ({
      login: dontCall,
      isLoading: false
    })
  },
  logoutIf: {
    useLogout: () => ({
      logout: dontCall
    })
  },
  createReviewIf: {
    useCreate: () => ({
      create: dontCall,
      isLoading: false,
      isSuccess: false,
      review: undefined
    }),
    getCurrentDate: () => new Date('2024-10-10'),
    selectBeerIf,
    reviewContainerIf
  },
  listReviewsIf: {
    useList: () => ({
      list: dontCall,
      reviewList: undefined,
      isLoading: false,
      isUninitialized: false
    }),
    infiniteScroll
  },
  listReviewsByBeerIf: {
    useList: dontCall
  },
  listReviewsByBreweryIf: {
    useList: dontCall
  },
  listReviewsByStyleIf: {
    useList: dontCall
  },
  reviewIf: {
    get: {
      useGet: dontCall
    },
    update: {
      useUpdate: dontCall,
      selectBeerIf,
      reviewContainerIf
    },
    login: getUndefinedLogin
  },
  statsIf: {
    annual: {
      useStats: () => ({
        stats: undefined,
        isLoading: false
      })
    },
    brewery: {
      useStats: dontCall,
      infiniteScroll
    },
    container: {
      useStats: dontCall
    },
    overall: {
      useStats: () => ({
        stats: undefined,
        isLoading: false
      })
    },
    rating: {
      useStats: dontCall
    },
    style: {
      useStats: dontCall
    },
    setSearch: async () => undefined
  },
  searchIf: {
    useSearch: () => ({
      activate: dontCall,
      isActive: false
    }),
    useDebounce
  },
  createStorageIf: {
    useCreate: () => ({
      create: dontCall,
      hasError: false,
      isLoading: false
    })
  },
  getStorageIf: {
    useGet: dontCall
  },
  listStoragesIf: {
    useList: () => ({
      storages: undefined,
      isLoading: false
    }),
    delete: deleteStorageIf
  },
  listStoragesByBeerIf: {
    useList: dontCall,
    delete: deleteStorageIf
  },
  listStoragesByBreweryIf: {
    useList: dontCall,
    delete: deleteStorageIf
  },
  listStoragesByStyleIf: {
    useList: dontCall,
    delete: deleteStorageIf
  },
  getStyleIf: {
    useGet: dontCall
  },
  listStylesIf,
  updateStyleIf: {
    useUpdate: dontCall
  },
  userIf: {
    create: {
      useCreate: () => ({
        create: dontCall,
        user: undefined,
        hasError: false,
        isLoading: false
      })
    },
    list: {
      useList: () => ({
        data: undefined,
        isLoading: false
      })
    },
    delete: {
      useDelete: () => ({
        delete: dontCall
      })
    }
  }
}

test('renders app login', () => {
  const { getByRole } = render(
    <Provider store={store}>
      <LinkWrapper>
        <App
          paramsIf={paramsIf}
          storeIf={storeIf}
        />
      </LinkWrapper>
    </Provider>
  )
  const loginButton = getByRole('button', { name: 'Login' })
  expect(loginButton).toBeDefined()
})

test('navigates to Beers', async () => {
  const user = userEvent.setup()
  const { getByRole } = render(
    <Provider store={store}>
      <LinkWrapper>
        <App
          paramsIf={paramsIf}
          storeIf={{
            ...storeIf,
            getLogin: getAdminLogin
          }} />
      </LinkWrapper>
    </Provider>
  )
  const addReviewLink = getByRole('link', { name: 'Add review' })
  await user.click(addReviewLink)
  getByRole('heading', { name: 'Add review' })

  const beersLink = getByRole('link', { name: 'Beers' })
  await user.click(beersLink)
  getByRole('heading', { name: 'Beers' })
})

interface NavigationTest {
  linkText: string,
  heading: string
}

const navigationTests: NavigationTest[] = [
  {
    linkText: 'Add review',
    heading: 'Add review'
  },
  {
    linkText: 'Breweries',
    heading: 'Breweries'
  },
  {
    linkText: 'Reviews',
    heading: 'Reviews'
  },
  {
    linkText: 'Statistics',
    heading: 'Statistics'
  },
  {
    linkText: 'Storage',
    heading: 'Storage beers'
  },
]

navigationTests.forEach(testCase => {
  test(`navigates to ${testCase.heading}`, async () => {
    const user = userEvent.setup()
    const { getByRole } = render(
      <Provider store={store}>
        <LinkWrapper>
          <App
            paramsIf={paramsIf}
            storeIf={{
              ...storeIf,
              getLogin: getAdminLogin
            }} />
        </LinkWrapper>
      </Provider>
    )
    const link = getByRole('link', { name: testCase.linkText })
    await user.click(link)
    getByRole('heading', { name: testCase.heading })
  })
})

const navigationMoreTests: NavigationTest[] = [
  {
    linkText: 'Styles',
    heading: 'Styles'
  },
  {
    linkText: 'Containers',
    heading: 'Containers'
  },
  {
    linkText: 'Users',
    heading: 'Users'
  },
  {
    linkText: 'Account',
    heading: 'Account'
  }
]

navigationMoreTests.forEach(testCase => {
  test(`navigates to ${testCase.heading}`, async () => {
    const user = userEvent.setup()
    const { getByRole } = render(
      <Provider store={store}>
        <LinkWrapper>
          <App
            paramsIf={paramsIf}
            storeIf={{
              ...storeIf,
              getLogin: getAdminLogin
            }} />
        </LinkWrapper>
      </Provider>
    )
    const moreButton = getByRole('button', { name: 'More' })
    await user.click(moreButton)

    const link = getByRole('link', { name: testCase.linkText })
    await user.click(link)
    getByRole('heading', { name: testCase.heading })
  })
})

test('loads annual stats directly', async () => {
  const user = userEvent.setup()
  const urlSearchParams = new URLSearchParams()
  urlSearchParams.append('stats', 'annual')
  const annualParamsIf: ParamsIf = {
    ...paramsIf,
    useSearch: () => urlSearchParams
  }
  const { getByRole, getByText } = render(
    <Provider store={store}>
      <LinkWrapper>
        <App
          paramsIf={annualParamsIf}
          storeIf={{
            ...storeIf,
            getLogin: getAdminLogin
          }} />
      </LinkWrapper>
    </Provider>
  )
  const link = getByRole('link', { name: 'Statistics' })
  await user.click(link)
  getByText('Year')
})
