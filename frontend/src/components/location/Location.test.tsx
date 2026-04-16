import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import { testTimes } from '../../../test-util/filter-time'
import Location from './Location'
import { Role } from '../../core/user/types'
import type { UseDebounce } from '../../core/types'
import type {
  GetAnnualContainerStatsIf,
  GetAnnualStatsIf,
  GetBreweryStatsIf,
  GetContainerStatsIf,
  GetLocationStatsIf,
  GetOverallStatsIf,
  GetRatingStatsIf,
  GetStyleStatsIf,
  StatsIf,
  YearMonth,
} from '../../core/stats/types'
import type {
  GetLocationIf,
  SearchLocationIf,
  UpdateLocationIf,
} from '../../core/location/types'
import type { GetLogin } from '../../core/login/types'
import type { ListReviewsByIf, ReviewIf } from '../../core/review/types'
import type { ParamsIf } from '../util'
import type { SearchIf } from '../../core/search/types'
import { loadingIndicatorText } from '../common/LoadingIndicator'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

const dontCall = (): any => {
  throw new Error('must not be called')
}

const id = '88471fe8-0f00-4a37-9b1c-9db78933c0a6'
const name = 'Oluthuone Pamimomestari'
const newNamePlaceholder = 'New name'

function getLogin(): GetLogin {
  return () => ({
    user: {
      id: 'ada1b9b1-ea66-4e17-bda8-f8ea1e65a020',
      username: 'admin',
      role: Role.admin,
    },
    authToken: 'auth',
    refreshToken: 'refresh',
  })
}

const dontSelectBeer = {
  create: {
    useCreate: dontCall,
    editBeerIf: {
      selectBreweryIf: {
        create: {
          useCreate: dontCall,
        },
        search: {
          useSearch: dontCall,
        },
      },
      selectStyleIf: {
        create: {
          useCreate: dontCall,
        },
        list: {
          useList: dontCall,
        },
      },
    },
  },
  search: {
    useSearch: dontCall,
  },
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
}

const noOpContainerIf = {
  createIf: {
    useCreate: dontCall,
  },
  listIf: {
    useList: dontCall,
  },
}

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

type NoStats = GetAnnualStatsIf &
  GetContainerStatsIf &
  GetOverallStatsIf &
  GetRatingStatsIf &
  GetStyleStatsIf

const noStats: NoStats = {
  useStats: () => ({
    stats: undefined,
    isLoading: false,
  }),
  minTime,
  maxTime,
  getUseDebounce,
}

type NoInfiniteScrollStats = GetAnnualContainerStatsIf &
  GetBreweryStatsIf &
  GetLocationStatsIf

const noInfiniteScrollStats: NoInfiniteScrollStats = {
  useStats: () => ({
    query: dontCall,
    stats: undefined,
    isLoading: false,
  }),
  infiniteScroll: dontCall,
  minTime,
  maxTime,
  getUseDebounce,
}

const statsIf: StatsIf = {
  annual: noStats,
  annualContainer: noInfiniteScrollStats,
  brewery: noInfiniteScrollStats,
  container: noStats,
  location: noInfiniteScrollStats,
  overall: noStats,
  rating: noStats,
  style: noStats,
  setSearch: async () => undefined,
}

const listReviewsByLocationIf: ListReviewsByIf = {
  useList: () => ({
    reviews: {
      reviews: [],
      sorting: {
        order: 'rating',
        direction: 'asc',
      },
    },
    isLoading: false,
  }),
}

const paramsIf: ParamsIf = {
  useParams: () => ({ locationId: id }),
  useSearch: () => ({
    get: (): undefined => undefined,
  }),
}

const reviewIf: ReviewIf = {
  get: {
    useGet: dontCall,
  },
  update: {
    useUpdate: dontCall,
    searchLocationIf,
    selectBeerIf: dontSelectBeer,
    reviewContainerIf: noOpContainerIf,
  },
  login: getLogin(),
}

const getLocationIf: GetLocationIf = {
  useGet: () => ({
    location: {
      id,
      name,
    },
    isLoading: false,
  }),
}

const searchIf: SearchIf = {
  useSearch: () => ({
    activate: (): undefined => undefined,
    isActive: true,
  }),
  useDebounce,
}

test('updates location', async () => {
  const user = userEvent.setup()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <Location
      listReviewsByLocationIf={listReviewsByLocationIf}
      paramsIf={paramsIf}
      reviewIf={reviewIf}
      getLocationIf={getLocationIf}
      updateLocationIf={{
        useUpdate: () => ({
          update,
          isLoading: false,
        }),
        login: getLogin(),
      }}
      statsIf={statsIf}
      searchIf={searchIf}
    />,
  )
  getByRole('heading', { name })

  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)

  const saveButton = getByRole('button', { name: 'Save' })
  const nameInput = getByPlaceholderText(newNamePlaceholder)
  await user.clear(nameInput)
  const newName = 'Oluthuone Panimomestari'
  await user.type(nameInput, newName)
  expect(saveButton.hasAttribute('disabled')).toEqual(false)
  await user.click(saveButton)
  const updateCalls = update.mock.calls
  expect(updateCalls).toEqual([
    [
      {
        id,
        name: newName,
      },
    ],
  ])
})

const dontUpdateLocationIf: UpdateLocationIf = {
  useUpdate: () => ({
    update: dontCall,
    isLoading: false,
  }),
  login: getLogin(),
}

test('cancel editing', async () => {
  const user = userEvent.setup()
  const { getByRole } = render(
    <Location
      listReviewsByLocationIf={listReviewsByLocationIf}
      paramsIf={paramsIf}
      reviewIf={reviewIf}
      getLocationIf={getLocationIf}
      updateLocationIf={dontUpdateLocationIf}
      statsIf={statsIf}
      searchIf={searchIf}
    />,
  )
  getByRole('heading', { name })

  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)

  const cancelButton = getByRole('button', { name: 'Cancel' })
  await user.click(cancelButton)

  getByRole('button', { name: 'Edit' })
})

test('throw on missing id', async () => {
  expect(() =>
    render(
      <Location
        listReviewsByLocationIf={listReviewsByLocationIf}
        paramsIf={{
          ...paramsIf,
          useParams: () => ({}),
        }}
        reviewIf={reviewIf}
        getLocationIf={getLocationIf}
        updateLocationIf={dontUpdateLocationIf}
        statsIf={statsIf}
        searchIf={searchIf}
      />,
    ),
  ).toThrow('Location component without locationId. Should not happen.')
})

test('render loading', async () => {
  const { getByText } = render(
    <Location
      listReviewsByLocationIf={listReviewsByLocationIf}
      paramsIf={paramsIf}
      reviewIf={reviewIf}
      getLocationIf={{
        useGet: () => ({
          location: undefined,
          isLoading: true,
        }),
      }}
      updateLocationIf={dontUpdateLocationIf}
      statsIf={statsIf}
      searchIf={searchIf}
    />,
  )
  getByText(loadingIndicatorText)
})

test('render not found', async () => {
  const { getByText } = render(
    <Location
      listReviewsByLocationIf={listReviewsByLocationIf}
      paramsIf={paramsIf}
      reviewIf={reviewIf}
      getLocationIf={{
        useGet: () => ({
          location: undefined,
          isLoading: false,
        }),
      }}
      updateLocationIf={dontUpdateLocationIf}
      statsIf={statsIf}
      searchIf={searchIf}
    />,
  )
  getByText('Not found')
})
