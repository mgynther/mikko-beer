import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import { testTimes } from '../../../test-util/filter-time'
import Style from './Style'
import { Role } from '../../core/user/types'
import LinkWrapper from '../LinkWrapper'
import type {
  JoinedReview,
  ListFilterIf,
  ListReviewsByIf,
  Review,
  ReviewIf,
  SetSearch,
  UpdateReviewIf,
} from '../../core/review/types'
import type { ListStoragesByIf, Storage } from '../../core/storage/types'
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
import type { GetStyleIf, UpdateStyleIf } from '../../core/style/types'
import type {
  UseDebounce,
  UseUrlSearchParams,
  YearMonth,
} from '../../core/types'
import { asText } from '../container/ContainerInfo'
import type { SearchFieldIf } from '../../core/search/types'
import type { UseUrlPathParams } from '../util'
import type { ReactNode } from 'react'
import { loadingIndicatorText } from '../common/LoadingIndicator'
import { dontCall } from '../../../test-util/dont-call'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

const brewery = {
  id: '6290fa39-3515-4682-a69c-51d18b2b03b1',
  name: 'Koskipanimo',
}

const parent = {
  id: '97dfdc08-67bb-4ba1-a29e-2f7dfdea4875',
  name: 'Pale Ale',
  parents: [],
}

const child = {
  id: '7217469e-4e16-45a1-9873-83ba81b21a37',
  name: 'NEIPA',
  parents: [],
}

const style = {
  id: 'd34ef4ef-87ac-4eeb-b08a-ad0d6d00f38d',
  name: 'IPA',
  parents: [parent],
  children: [child],
}

const beer = {
  id: '4eee87d3-a451-46bf-a8dc-16778bc108af',
  name: 'Smörre',
  breweries: [brewery],
  styles: [style],
}

const joinedReview: JoinedReview = {
  id: '6cf9fdd2-e922-4bc6-bac5-0f231193679e',
  additionalInfo: 'From batch #123',
  beerId: beer.id,
  beerName: beer.name,
  breweries: [],
  container: {
    id: '345a65ed-3bb2-4be3-a370-5610e5d0edd0',
    type: 'bottle',
    size: '0.33',
  },
  location: undefined,
  styles: [],
  time: '2024-10-12T15:23:45.000Z',
  rating: 10,
}

const review: Review = {
  id: joinedReview.id,
  additionalInfo: joinedReview.additionalInfo,
  beer: beer.id,
  container: joinedReview.container.id,
  location: '',
  time: joinedReview.time,
  rating: 10,
  smell: '',
  taste: '',
}

const storage: Storage = {
  id: '350d015b-22d7-4bc7-b126-19ad09c5733c',
  beerId: beer.id,
  beerName: beer.name,
  bestBefore: '2025-01-30T12:00:00.000',
  breweries: joinedReview.breweries,
  container: joinedReview.container,
  createdAt: '2023-02-02T12:00:00.000Z',
  hasReview: false,
  styles: joinedReview.styles,
}

const login = {
  user: {
    id: 'dc39260f-b459-4688-9103-08ef7ad903b0',
    username: 'mikko',
    role: Role.admin,
  },
  authToken: '',
  refreshToken: '',
}

const searchFieldIf: SearchFieldIf = {
  useSearchField: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
}

const updateReview: UpdateReviewIf = {
  useUpdate: dontCall,
  searchLocationIf: {
    useSearch: () => ({
      search: dontCall,
      isLoading: false,
    }),
    create: {
      useCreate: dontCall,
    },
    searchFieldIf,
  },
  selectBeerIf: {
    create: {
      useCreate: dontCall,
      editBeerIf: {
        selectBreweryIf: {
          create: {
            useCreate: () => ({
              create: dontCall,
              isLoading: false,
            }),
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
          list: {
            useList: () => ({
              styles: [],
              isLoading: false,
            }),
            searchFieldIf,
          },
        },
      },
    },
    search: {
      useSearch: dontCall,
      searchFieldIf,
    },
  },
  reviewContainerIf: {
    createIf: {
      useCreate: dontCall,
    },
    listIf: {
      useList: dontCall,
    },
  },
}

const getStyleIf: GetStyleIf = {
  useGet: () => ({
    style,
    isLoading: false,
  }),
}

const reviewIf: ReviewIf = {
  get: {
    useGet: () => ({
      review,
      get: async () => review,
    }),
  },
  update: updateReview,
  getLogin: () => login,
}

const useUrlSearchParams: UseUrlSearchParams = () => ({
  get: () => undefined,
})

const useUrlPathParams: UseUrlPathParams = () => ({
  styleId: style.id,
})

const listFilterIf: (setSearch: SetSearch) => ListFilterIf = (
  setSearch: SetSearch,
) => ({
  getUseDebounce,
  minTime,
  maxTime,
  setSearch,
  useUrlSearchParams: useUrlSearchParams,
})

function getListReviewsIf(reviews: JoinedReview[]): ListReviewsByIf {
  return {
    useList: () => ({
      reviews: {
        reviews,
        sorting: {
          order: 'brewery_name',
          direction: 'asc',
        },
      },
      isLoading: false,
    }),
    filterIf: listFilterIf(() => undefined),
    reviewIf,
  }
}

function getListStoragesByStyleIf(
  storages: Storage[] | undefined,
): ListStoragesByIf {
  return {
    useList: () => ({
      storages: storages
        ? {
            storages,
          }
        : undefined,
      isLoading: storages !== undefined,
    }),
    delete: {
      useDelete: () => ({
        delete: dontCall,
      }),
      getLogin: () => login,
    },
  }
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

const dontUpdate: UpdateStyleIf = {
  useUpdate: () => ({
    update: dontCall,
    hasError: false,
    isLoading: false,
    isSuccess: false,
  }),
  getLogin: () => login,
}

test('renders style', async () => {
  const { getByRole } = render(
    <LinkWrapper>
      <Style
        updateStyleIf={dontUpdate}
        listReviewsByStyleIf={getListReviewsIf([joinedReview])}
        listStoragesByStyleIf={getListStoragesByStyleIf(undefined)}
        getStyleIf={getStyleIf}
        statsIf={statsIf}
        useUrlPathParams={useUrlPathParams}
      />
    </LinkWrapper>,
  )

  getByRole('heading', { name: style.name })
  getByRole('link', { name: parent.name })
  getByRole('link', { name: child.name })
})

test('renders storages', async () => {
  const { getByRole, getByText } = render(
    <LinkWrapper>
      <Style
        updateStyleIf={dontUpdate}
        listReviewsByStyleIf={getListReviewsIf([joinedReview])}
        listStoragesByStyleIf={getListStoragesByStyleIf([storage])}
        getStyleIf={getStyleIf}
        statsIf={statsIf}
        useUrlPathParams={useUrlPathParams}
      />
    </LinkWrapper>,
  )
  getByRole('heading', { name: style.name })
  getByText(joinedReview.additionalInfo)
  getByText(asText(joinedReview.container))
  getByText(storage.bestBefore.split('T')[0])
})

test('renders loading when loading', async () => {
  const { getByText } = render(
    <LinkWrapper>
      <Style
        updateStyleIf={dontUpdate}
        listReviewsByStyleIf={getListReviewsIf([joinedReview])}
        listStoragesByStyleIf={getListStoragesByStyleIf(undefined)}
        getStyleIf={{
          useGet: () => ({
            style: undefined,
            isLoading: true,
          }),
        }}
        statsIf={statsIf}
        useUrlPathParams={useUrlPathParams}
      />
    </LinkWrapper>,
  )
  getByText(loadingIndicatorText)
})

test('renders not found when not found', async () => {
  const { getByText } = render(
    <LinkWrapper>
      <Style
        updateStyleIf={dontUpdate}
        listReviewsByStyleIf={getListReviewsIf([joinedReview])}
        listStoragesByStyleIf={getListStoragesByStyleIf([storage])}
        getStyleIf={{
          useGet: () => ({
            style: undefined,
            isLoading: false,
          }),
        }}
        statsIf={statsIf}
        useUrlPathParams={useUrlPathParams}
      />
    </LinkWrapper>,
  )
  getByText('Not found')
})

test('throw without style id', async () => {
  expect(() =>
    render(
      <LinkWrapper>
        <Style
          updateStyleIf={dontUpdate}
          listReviewsByStyleIf={getListReviewsIf([joinedReview])}
          listStoragesByStyleIf={getListStoragesByStyleIf([storage])}
          getStyleIf={getStyleIf}
          statsIf={statsIf}
          useUrlPathParams={() => ({})}
        />
      </LinkWrapper>,
    ),
  ).toThrow()
})

test('updates style', async () => {
  const user = userEvent.setup()
  const update = vitest.fn()
  const styleName = 'Rye IPA'
  const getNode: () => ReactNode = () => (
    <LinkWrapper>
      <Style
        updateStyleIf={{
          useUpdate: () => ({
            update,
            hasError: false,
            isLoading: false,
            isSuccess: update.mock.calls.length > 0,
          }),
          getLogin: () => login,
        }}
        listReviewsByStyleIf={getListReviewsIf([])}
        listStoragesByStyleIf={getListStoragesByStyleIf([])}
        getStyleIf={{
          useGet: () => {
            const hasUpdate = update.mock.calls.length > 0
            return {
              style: {
                ...style,
                name: hasUpdate ? styleName : style.name,
                parents: hasUpdate ? [] : style.parents,
              },
              isLoading: false,
            }
          },
        }}
        statsIf={statsIf}
        useUrlPathParams={useUrlPathParams}
      />
    </LinkWrapper>
  )
  const { getByRole, getByPlaceholderText, getByText, rerender } =
    render(getNode())

  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  const nameInput = getByPlaceholderText('Name')
  await user.clear(nameInput)
  await user.type(nameInput, styleName)
  const removeParentButton = getByRole('button', { name: 'Remove' })
  await user.click(removeParentButton)
  const saveButton = getByRole('button', { name: 'Save' })
  await user.click(saveButton)
  expect(update.mock.calls).toEqual([
    [
      {
        id: style.id,
        name: styleName,
        parents: [],
      },
    ],
  ])
  rerender(getNode())
  await waitFor(() => {
    expect(getByRole('heading', { name: styleName }))
  })
  expect(getByText('-')).toBeDefined()
})

test('cancels update', async () => {
  const user = userEvent.setup()
  const update = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <Style
        updateStyleIf={{
          useUpdate: () => ({
            update,
            hasError: false,
            isLoading: false,
            isSuccess: false,
          }),
          getLogin: () => login,
        }}
        listReviewsByStyleIf={getListReviewsIf([])}
        listStoragesByStyleIf={getListStoragesByStyleIf([])}
        getStyleIf={getStyleIf}
        statsIf={statsIf}
        useUrlPathParams={useUrlPathParams}
      />
    </LinkWrapper>,
  )

  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  const cancelButton = getByRole('button', { name: 'Cancel' })
  await user.click(cancelButton)
  getByRole('heading', { name: style.name })
})
