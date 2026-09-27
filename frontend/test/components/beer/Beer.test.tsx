import { test } from '../../test'
import { assertDeepEqual, assertThrowsWithMessage } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'
import { setupUser } from '../../user-event'
import Beer from '../../../src/components/beer/Beer'
import { Role } from '../../../src/components/types/user/types'
import type {
  IdFilteredListReviewParams,
  JoinedReview,
  ListFilterIf,
  ListReviewsByIf,
  ReviewIf,
  SetSearch,
  UpdateReviewIf,
} from '../../../src/components/types/review/types'
import type { ListStoragesByIf } from '../../../src/components/types/storage/types'
import type {
  UseDebounce,
  UseUrlSearchParams,
  YearMonth,
} from '../../../src/components/types/types'
import { asText } from '../../../src/components/internal/container/ContainerInfo'
import type { SearchLocationIf } from '../../../src/components/types/location/types'
import type { SearchFieldIf } from '../../../src/components/types/search/types'
import type {
  EditBeerIf,
  GetBeerIf,
  UpdateBeerLoginIf,
} from '../../../src/components/types/beer/types'
import type { UseUrlPathParams } from '../../../src/components/types/types'
import { loadingIndicatorText } from '../../../src/components/internal/common/LoadingIndicator'
import { testTimes } from '../filter-time'
import { dontCall } from '../../dont-call'
import { buildContainer } from '../types/container/builders'
import { buildLogin } from '../types/login/builders'
import { buildJoinedReview, buildReview } from '../types/review/builders'
import { buildUser } from '../types/user/builders'
import { testLink } from '../link'
import type { BeerWithIds } from '../../../src/components/types/beer/types'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

const brewery = {
  id: 'a5a8968d-4556-4f66-8351-21f724cc8316',
  name: 'Koskipanimo',
}

const style = {
  id: '0344f996-1475-45b6-aa84-ac7e0da47c7c',
  name: 'IPA',
  parents: [],
}

const beer = {
  id: '60b1745f-0d7e-48c2-a993-90f127dd81ff',
  name: 'Smörre',
  breweries: [brewery],
  styles: [style],
}

const joinedReview = buildJoinedReview({
  additionalInfo: 'From batch #123',
  container: buildContainer({ type: 'bottle', size: '0.33' }),
})

const review = buildReview()

const login = buildLogin({ user: buildUser({ role: Role.admin }) })

const dontCreate = {
  create: dontCall,
  isLoading: false,
}

const searchFieldIf: SearchFieldIf = {
  useSearchField: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
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

const updateReview: UpdateReviewIf = {
  useUpdate: dontCall,
  searchLocationIf,
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
            useList: dontCall,
            searchFieldIf: {
              useSearchField: dontCall,
              useDebounce: dontCall,
            },
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

const getBeerIf: GetBeerIf = {
  useGetBeer: () => ({
    beer,
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

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const useUrlSearchParams: UseUrlSearchParams = () => ({
  get: (): undefined => undefined,
})

const useUrlPathParams: UseUrlPathParams = () => ({
  beerId: beer.id,
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

function getListReviewsIf(reviews: JoinedReview[]): ListReviewsByIf {
  return {
    useList: () => ({
      reviews: {
        reviews,
        sorting: {
          order: 'time',
          direction: 'asc',
        },
      },
      isLoading: reviews.length === 0,
    }),
    filterIf: listFilterIf(() => undefined),
    reviewIf,
  }
}

const listStoragesByBeerIf: ListStoragesByIf = {
  useList: () => ({
    storages: {
      storages: [],
    },
    isLoading: false,
  }),
  delete: {
    useDelete: () => ({
      delete: dontCall,
    }),
    getLogin: () => login,
  },
}

const editBeerIf: EditBeerIf = {
  selectBreweryIf: {
    create: {
      useCreate: () => dontCreate,
    },
    search: {
      useSearch: () => ({
        search: dontCall,
        isLoading: false,
      }),
      searchFieldIf: {
        useSearchField: dontCall,
        useDebounce: dontCall,
      },
    },
  },
  selectStyleIf: {
    create: {
      useCreate: () => ({
        ...dontCreate,
        createdStyle: undefined,
        hasError: false,
        isSuccess: false,
      }),
    },
    list: {
      useList: () => ({
        styles: [],
        isLoading: false,
      }),
      searchFieldIf: {
        useSearchField: dontCall,
        useDebounce: dontCall,
      },
    },
  },
}

const dontUpdateBeerIf: UpdateBeerLoginIf = {
  useUpdate: () => ({
    update: dontCall,
    isLoading: false,
  }),
  editBeerIf,
  getLogin: () => login,
}

test('renders beer', async () => {
  const { getByRole, getByText } = render(
    <Beer
      linkComponent={testLink}
      updateBeerLoginIf={dontUpdateBeerIf}
      listReviewsByBeerIf={getListReviewsIf([joinedReview])}
      listStoragesByBeerIf={listStoragesByBeerIf}
      getBeerIf={getBeerIf}
      useUrlPathParams={useUrlPathParams}
    />,
  )

  getByRole('heading', { name: beer.name })
  getByRole('link', { name: brewery.name })
  getByRole('link', { name: style.name })
  getByText(joinedReview.additionalInfo)
  getByText(asText(joinedReview.container))
})

test('throw on missing id', async () => {
  assertThrowsWithMessage(
    () =>
      render(
        <Beer
          linkComponent={testLink}
          updateBeerLoginIf={dontUpdateBeerIf}
          listReviewsByBeerIf={getListReviewsIf([joinedReview])}
          listStoragesByBeerIf={listStoragesByBeerIf}
          getBeerIf={getBeerIf}
          useUrlPathParams={() => ({})}
        />,
      ),
    'Beer component without beerId. Should not happen.',
  )
})

test('updates beer', async () => {
  const user = setupUser()
  const update = mockFunction<[request: BeerWithIds]>()
  const { getByRole, getByPlaceholderText } = render(
    <Beer
      linkComponent={testLink}
      updateBeerLoginIf={{
        useUpdate: () => ({
          update,
          isLoading: false,
        }),
        editBeerIf,
        getLogin: () => login,
      }}
      listReviewsByBeerIf={getListReviewsIf([])}
      listStoragesByBeerIf={listStoragesByBeerIf}
      getBeerIf={getBeerIf}
      useUrlPathParams={useUrlPathParams}
    />,
  )

  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  const nameInput = getByPlaceholderText('Name')
  await user.clear(nameInput)
  const beerName = 'Sumutar'
  await user.type(nameInput, beerName)
  const saveButton = getByRole('button', { name: 'Save' })
  await user.click(saveButton)
  assertDeepEqual(update.mock.calls, [
    [
      {
        ...beer,
        name: beerName,
        breweries: [brewery.id],
        styles: [style.id],
      },
    ],
  ])
})

test('cancel update', async () => {
  const user = setupUser()
  const { getByRole } = render(
    <Beer
      linkComponent={testLink}
      updateBeerLoginIf={dontUpdateBeerIf}
      listReviewsByBeerIf={getListReviewsIf([])}
      listStoragesByBeerIf={listStoragesByBeerIf}
      getBeerIf={getBeerIf}
      useUrlPathParams={useUrlPathParams}
    />,
  )

  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  const cancelButton = getByRole('button', { name: 'Cancel' })
  await user.click(cancelButton)
  getByRole('button', { name: 'Edit' })
})

test('render loading', async () => {
  const { getByText } = render(
    <Beer
      linkComponent={testLink}
      updateBeerLoginIf={dontUpdateBeerIf}
      listReviewsByBeerIf={getListReviewsIf([])}
      listStoragesByBeerIf={listStoragesByBeerIf}
      getBeerIf={{
        useGetBeer: () => ({
          beer: undefined,
          isLoading: true,
        }),
      }}
      useUrlPathParams={useUrlPathParams}
    />,
  )
  getByText(loadingIndicatorText)
})

test('render not found', async () => {
  const { getByText } = render(
    <Beer
      linkComponent={testLink}
      updateBeerLoginIf={dontUpdateBeerIf}
      listReviewsByBeerIf={getListReviewsIf([])}
      listStoragesByBeerIf={listStoragesByBeerIf}
      getBeerIf={{
        useGetBeer: () => ({
          beer: undefined,
          isLoading: false,
        }),
      }}
      useUrlPathParams={useUrlPathParams}
    />,
  )
  getByText('Not found')
})

test('load reviews', async () => {
  const useList = mockFunction<[params: IdFilteredListReviewParams]>()
  render(
    <Beer
      linkComponent={testLink}
      updateBeerLoginIf={dontUpdateBeerIf}
      listReviewsByBeerIf={{
        useList: (params: IdFilteredListReviewParams) => {
          useList(params)
          return {
            reviews: {
              reviews: [joinedReview],
              sorting: {
                order: 'time',
                direction: 'asc',
              },
            },
            isLoading: false,
          }
        },
        filterIf: listFilterIf(() => undefined),
        reviewIf,
      }}
      listStoragesByBeerIf={listStoragesByBeerIf}
      getBeerIf={getBeerIf}
      useUrlPathParams={useUrlPathParams}
    />,
  )
  assertDeepEqual(useList.mock.calls, [
    [
      {
        id: beer.id,
        sorting: { direction: 'asc', order: 'beer_name' },
        filter: {
          minRating: 4,
          maxRating: 10,
          minTime: testTimes.min.utcTimestamp,
          maxTime: testTimes.max.utcTimestamp,
        },
      },
    ],
  ])
})

test('sort reviews', async () => {
  const user = setupUser()
  const setSearch = mockFunction<[state: Record<string, string>]>()
  const { getByRole } = render(
    <Beer
      linkComponent={testLink}
      updateBeerLoginIf={dontUpdateBeerIf}
      listReviewsByBeerIf={{
        useList: () => {
          return {
            reviews: {
              reviews: [joinedReview],
              sorting: {
                order: 'time',
                direction: 'asc',
              },
            },
            isLoading: false,
          }
        },
        filterIf: listFilterIf(setSearch),
        reviewIf: reviewIf,
      }}
      listStoragesByBeerIf={listStoragesByBeerIf}
      getBeerIf={getBeerIf}
      useUrlPathParams={useUrlPathParams}
    />,
  )
  const ratingButton = getByRole('button', { name: 'Rating' })
  await user.click(ratingButton)
  assertDeepEqual(setSearch.mock.calls, [
    [
      {
        r_direction: 'asc',
        r_filters: '0',
        r_max_rating: '10',
        r_max_time: '2024-12',
        r_min_rating: '4',
        r_min_time: '2017-12',
        r_order: 'beer_name',
      },
    ],
    [
      {
        r_direction: 'desc',
        r_filters: '0',
        r_max_rating: '10',
        r_max_time: '2024-12',
        r_min_rating: '4',
        r_min_time: '2017-12',
        r_order: 'rating',
      },
    ],
  ])
})

test('show loading indicator', async () => {
  const { getByText } = render(
    <Beer
      linkComponent={testLink}
      updateBeerLoginIf={dontUpdateBeerIf}
      listReviewsByBeerIf={{
        useList: () => {
          return {
            reviews: undefined,
            isLoading: true,
          }
        },
        filterIf: listFilterIf(() => undefined),
        reviewIf: reviewIf,
      }}
      listStoragesByBeerIf={listStoragesByBeerIf}
      getBeerIf={getBeerIf}
      useUrlPathParams={useUrlPathParams}
    />,
  )
  getByText(loadingIndicatorText)
})
