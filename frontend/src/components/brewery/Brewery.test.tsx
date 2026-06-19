import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import { testTimes } from '../../../test-util/filter-time'
import Brewery from './Brewery'
import { Role } from '../../core/user/types'
import type {
  UseDebounce,
  UseUrlSearchParams,
  YearMonth,
} from '../../core/types'
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
} from '../../core/stats/types'
import type { SearchLocationIf } from '../../core/location/types'
import type { GetLogin } from '../../core/login/types'
import type {
  ListFilterIf,
  ListReviewsByIf,
  ReviewIf,
  SetSearch,
} from '../../core/review/types'
import type { ListStoragesByIf } from '../../core/storage/types'
import type { GetBreweryIf, UpdateBreweryIf } from '../../core/brewery/types'
import type { SearchFieldIf } from '../../core/search/types'
import type { UseUrlPathParams } from '../util'
import { loadingIndicatorText } from '../common/LoadingIndicator'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

const id = 'f57c65dd-80b1-46db-a41c-21ad137cb2a8'
const name = 'Hopping Brewsters'
const newNamePlaceholder = 'New name'

const dontCall = (): any => {
  throw new Error('must not be called')
}

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
    searchFieldIf: {
      useSearchField: dontCall,
      useDebounce: dontCall,
    },
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

type NoStats = GetAnnualStatsIf &
  GetContainerStatsIf &
  GetOverallStatsIf &
  GetRatingStatsIf &
  GetStyleStatsIf

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

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

const useUrlSearchParams: UseUrlSearchParams = () => ({
  get: (): undefined => undefined,
})

const useUrlPathParams: UseUrlPathParams = () => ({
  breweryId: '63a33cb5-50ca-43f3-9e63-065f21751a12',
})

const statsIf: StatsIf = {
  annual: noStats,
  annualContainer: noInfiniteScrollStats,
  brewery: noInfiniteScrollStats,
  container: noStats,
  location: noInfiniteScrollStats,
  overall: noStats,
  rating: noStats,
  style: noStats,
  setSearch: () => undefined,
  useUrlSearchParams,
}

const listFilterIf: (setSearch: SetSearch) => ListFilterIf = (
  setSearch: SetSearch,
) => ({
  getUseDebounce,
  minTime,
  maxTime,
  setSearch,
  useUrlSearchParams,
})

const listReviewsByBreweryIf: ListReviewsByIf = {
  useList: () => ({
    reviews: {
      reviews: [],
      sorting: {
        order: 'time',
        direction: 'desc',
      },
    },
    isLoading: false,
  }),
  filterIf: listFilterIf(() => undefined),
}

const listStoragesByBreweryIf: ListStoragesByIf = {
  useList: () => ({
    storages: { storages: [] },
    isLoading: false,
  }),
  delete: {
    useDelete: dontCall,
  },
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

const getBreweryIf: GetBreweryIf = {
  useGet: () => ({
    brewery: {
      id,
      name,
    },
    isLoading: false,
  }),
}

const searchFieldIf: SearchFieldIf = {
  useSearchField: () => ({
    activate: dontCall,
    isActive: true,
  }),
  useDebounce,
}

test('updates brewery', async () => {
  const user = userEvent.setup()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <Brewery
      listReviewsByBreweryIf={listReviewsByBreweryIf}
      listStoragesByBreweryIf={listStoragesByBreweryIf}
      reviewIf={reviewIf}
      getBreweryIf={getBreweryIf}
      updateBreweryIf={{
        useUpdate: () => ({
          update,
          isLoading: false,
        }),
      }}
      searchFieldIf={searchFieldIf}
      statsIf={statsIf}
      useUrlPathParams={useUrlPathParams}
    />,
  )
  getByRole('heading', { name })

  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)

  const saveButton = getByRole('button', { name: 'Save' })
  const nameInput = getByPlaceholderText(newNamePlaceholder)
  await user.clear(nameInput)
  const newName = 'Hopping Brewsters R.I.P.'
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

const dontUpdateBreweryIf: UpdateBreweryIf = {
  useUpdate: () => ({
    update: dontCall,
    isLoading: false,
  }),
}

test('cancel update', async () => {
  const user = userEvent.setup()
  const { getByRole } = render(
    <Brewery
      listReviewsByBreweryIf={listReviewsByBreweryIf}
      listStoragesByBreweryIf={listStoragesByBreweryIf}
      reviewIf={reviewIf}
      getBreweryIf={getBreweryIf}
      updateBreweryIf={dontUpdateBreweryIf}
      searchFieldIf={searchFieldIf}
      statsIf={statsIf}
      useUrlPathParams={useUrlPathParams}
    />,
  )
  getByRole('heading', { name })

  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)

  const cancelButton = getByRole('button', { name: 'Cancel' })
  await user.click(cancelButton)

  getByRole('button', { name: 'Edit' })
})

test('render loading', async () => {
  const { getByText } = render(
    <Brewery
      listReviewsByBreweryIf={listReviewsByBreweryIf}
      listStoragesByBreweryIf={listStoragesByBreweryIf}
      reviewIf={reviewIf}
      getBreweryIf={{
        useGet: () => ({
          brewery: undefined,
          isLoading: true,
        }),
      }}
      updateBreweryIf={dontUpdateBreweryIf}
      searchFieldIf={searchFieldIf}
      statsIf={statsIf}
      useUrlPathParams={useUrlPathParams}
    />,
  )
  getByText(loadingIndicatorText)
})

test('render not found', async () => {
  const { getByText } = render(
    <Brewery
      listReviewsByBreweryIf={listReviewsByBreweryIf}
      listStoragesByBreweryIf={listStoragesByBreweryIf}
      reviewIf={reviewIf}
      getBreweryIf={{
        useGet: () => ({
          brewery: undefined,
          isLoading: false,
        }),
      }}
      updateBreweryIf={dontUpdateBreweryIf}
      searchFieldIf={searchFieldIf}
      statsIf={statsIf}
      useUrlPathParams={useUrlPathParams}
    />,
  )
  getByText('Not found')
})

test('throw on missing id', async () => {
  expect(() =>
    render(
      <Brewery
        listReviewsByBreweryIf={listReviewsByBreweryIf}
        listStoragesByBreweryIf={listStoragesByBreweryIf}
        reviewIf={reviewIf}
        getBreweryIf={getBreweryIf}
        updateBreweryIf={dontUpdateBreweryIf}
        searchFieldIf={searchFieldIf}
        statsIf={statsIf}
        useUrlPathParams={() => ({})}
      />,
    ),
  ).toThrow('Brewery component without breweryId. Should not happen.')
})
