import { test } from '../../test'
import { assertDeepEqual, assertDefined, assertThrows } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'
import { setupUser } from '../../user-event'
import { testTimes } from '../filter-time'
import Style from '../../../src/components/style/Style'
import { Role } from '../../../src/components/types/user/types'
import type {
  JoinedReview,
  ListFilterIf,
  ListReviewsByIf,
  ReviewIf,
  SetSearch,
  UpdateReviewIf,
} from '../../../src/components/types/review/types'
import type {
  ListStoragesByIf,
  Storage,
} from '../../../src/components/types/storage/types'
import type {
  GetAnnualContainerStatsIf,
  GetAnnualStatsIf,
  GetBreweryCountryStatsIf,
  GetBreweryStatsIf,
  GetContainerStatsIf,
  GetLocationStatsIf,
  GetOverallStatsIf,
  GetRatingStatsIf,
  GetStyleStatsIf,
  StatsIf,
} from '../../../src/components/types/stats/types'
import type {
  GetStyleIf,
  UpdateStyleIf,
} from '../../../src/components/types/style/types'
import type {
  UseDebounce,
  UseUrlSearchParams,
  YearMonth,
} from '../../../src/components/types/types'
import { asText } from '../../../src/components/internal/container/ContainerInfo'
import type { SearchFieldIf } from '../../../src/components/types/search/types'
import type { UseUrlPathParams } from '../../../src/components/types/types'
import type { ReactNode } from 'react'
import { loadingIndicatorText } from '../../../src/components/internal/common/LoadingIndicator'
import { dontCall } from '../../dont-call'
import { buildContainer } from '../types/container/builders'
import { buildJoinedReview, buildReview } from '../types/review/builders'
import { buildStorage } from '../types/storage/builders'
import { testLink } from '../link'
import { buildLogin } from '../types/login/builders'
import { buildUser } from '../types/user/builders'
import type { StyleWithParentIds } from '../../../src/components/types/style/types'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
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

const joinedReview = buildJoinedReview({
  additionalInfo: 'From batch #123',
  container: buildContainer({ type: 'bottle', size: '0.33' }),
})

const review = buildReview()

const storage = buildStorage({ bestBefore: '2025-01-30T12:00:00.000' })

const login = buildLogin({ user: buildUser({ role: Role.admin }) })

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
  GetBreweryCountryStatsIf &
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
  breweryCountry: noInfiniteScrollStats,
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
    <Style
      linkComponent={testLink}
      updateStyleIf={dontUpdate}
      listReviewsByStyleIf={getListReviewsIf([joinedReview])}
      listStoragesByStyleIf={getListStoragesByStyleIf(undefined)}
      getStyleIf={getStyleIf}
      statsIf={statsIf}
      useUrlPathParams={useUrlPathParams}
    />,
  )

  getByRole('heading', { name: style.name })
  getByRole('link', { name: parent.name })
  getByRole('link', { name: child.name })
})

test('renders storages', async () => {
  const { getByRole, getByText } = render(
    <Style
      linkComponent={testLink}
      updateStyleIf={dontUpdate}
      listReviewsByStyleIf={getListReviewsIf([joinedReview])}
      listStoragesByStyleIf={getListStoragesByStyleIf([storage])}
      getStyleIf={getStyleIf}
      statsIf={statsIf}
      useUrlPathParams={useUrlPathParams}
    />,
  )
  getByRole('heading', { name: style.name })
  getByText(joinedReview.additionalInfo)
  getByText(asText(joinedReview.container))
  getByText(storage.bestBefore.split('T')[0])
})

test('renders loading when loading', async () => {
  const { getByText } = render(
    <Style
      linkComponent={testLink}
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
    />,
  )
  getByText(loadingIndicatorText)
})

test('renders not found when not found', async () => {
  const { getByText } = render(
    <Style
      linkComponent={testLink}
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
    />,
  )
  getByText('Not found')
})

test('throw without style id', async () => {
  assertThrows(() =>
    render(
      <Style
        linkComponent={testLink}
        updateStyleIf={dontUpdate}
        listReviewsByStyleIf={getListReviewsIf([joinedReview])}
        listStoragesByStyleIf={getListStoragesByStyleIf([storage])}
        getStyleIf={getStyleIf}
        statsIf={statsIf}
        useUrlPathParams={() => ({})}
      />,
    ),
  )
})

test('updates style', async () => {
  const user = setupUser()
  const update = mockFunction<[style: StyleWithParentIds]>()
  const styleName = 'Rye IPA'
  const getNode: () => ReactNode = () => (
    <Style
      linkComponent={testLink}
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
  assertDeepEqual(update.mock.calls, [
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
    assertDefined(getByRole('heading', { name: styleName }))
  })
  assertDefined(getByText('-'))
})

test('cancels update', async () => {
  const user = setupUser()
  const update = mockFunction<[style: StyleWithParentIds]>()
  const { getByRole } = render(
    <Style
      linkComponent={testLink}
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
    />,
  )

  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  const cancelButton = getByRole('button', { name: 'Cancel' })
  await user.click(cancelButton)
  getByRole('heading', { name: style.name })
})
