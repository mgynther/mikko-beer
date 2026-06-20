import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Beer from './Beer'
import { Role } from '../../core/user/types'
import LinkWrapper from '../LinkWrapper'
import type {
  IdFilteredListReviewParams,
  JoinedReview,
  ListFilterIf,
  ListReviewsByIf,
  Review,
  ReviewIf,
  SetSearch,
  UpdateReviewIf,
} from '../../core/review/types'
import type { ListStoragesByIf } from '../../core/storage/types'
import type {
  UseDebounce,
  UseUrlSearchParams,
  YearMonth,
} from '../../core/types'
import { asText } from '../container/ContainerInfo'
import type { SearchLocationIf } from '../../core/location/types'
import type { SearchFieldIf } from '../../core/search/types'
import type { EditBeerIf, GetBeerIf, UpdateBeerIf } from '../../core/beer/types'
import type { UseUrlPathParams } from '../util'
import { loadingIndicatorText } from '../common/LoadingIndicator'
import { testTimes } from '../../../test-util/filter-time'
import { dontCall } from '../../../test-util/dont-call'

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

const joinedReview: JoinedReview = {
  id: '9a3f616c-b6f3-4053-9986-64312b9547fe',
  additionalInfo: 'From batch #123',
  beerId: beer.id,
  beerName: beer.name,
  breweries: [],
  container: {
    id: '27a356d5-128a-4eab-83eb-00f8043288a3',
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

const login = {
  user: {
    id: '5046343b-5a39-40db-83fa-6833e7216d42',
    username: 'mikko',
    role: Role.admin,
  },
  authToken: '',
  refreshToken: '',
}

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
  login: () => login,
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

const dontUpdateBeerIf: UpdateBeerIf = {
  useUpdate: () => ({
    update: dontCall,
    isLoading: false,
  }),
  editBeerIf,
}

test('renders beer', async () => {
  const { getByRole, getByText } = render(
    <LinkWrapper>
      <Beer
        updateBeerIf={dontUpdateBeerIf}
        searchFieldIf={searchFieldIf}
        listReviewsByBeerIf={getListReviewsIf([joinedReview])}
        listStoragesByBeerIf={listStoragesByBeerIf}
        reviewIf={reviewIf}
        getBeerIf={getBeerIf}
        useUrlPathParams={useUrlPathParams}
      />
    </LinkWrapper>,
  )

  getByRole('heading', { name: beer.name })
  getByRole('link', { name: brewery.name })
  getByRole('link', { name: style.name })
  getByText(joinedReview.additionalInfo)
  getByText(asText(joinedReview.container))
})

test('throw on missing id', async () => {
  expect(() =>
    render(
      <LinkWrapper>
        <Beer
          updateBeerIf={dontUpdateBeerIf}
          searchFieldIf={searchFieldIf}
          listReviewsByBeerIf={getListReviewsIf([joinedReview])}
          listStoragesByBeerIf={listStoragesByBeerIf}
          reviewIf={reviewIf}
          getBeerIf={getBeerIf}
          useUrlPathParams={() => ({})}
        />
      </LinkWrapper>,
    ),
  ).toThrow('Beer component without beerId. Should not happen.')
})

test('updates beer', async () => {
  const user = userEvent.setup()
  const update = vitest.fn()
  const { getByRole, getByPlaceholderText } = render(
    <LinkWrapper>
      <Beer
        updateBeerIf={{
          useUpdate: () => ({
            update,
            isLoading: false,
          }),
          editBeerIf,
        }}
        searchFieldIf={searchFieldIf}
        listReviewsByBeerIf={getListReviewsIf([])}
        listStoragesByBeerIf={listStoragesByBeerIf}
        reviewIf={reviewIf}
        getBeerIf={getBeerIf}
        useUrlPathParams={useUrlPathParams}
      />
    </LinkWrapper>,
  )

  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  const nameInput = getByPlaceholderText('Name')
  await user.clear(nameInput)
  const beerName = 'Sumutar'
  await user.type(nameInput, beerName)
  const saveButton = getByRole('button', { name: 'Save' })
  await user.click(saveButton)
  expect(update.mock.calls).toEqual([
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
  const user = userEvent.setup()
  const { getByRole } = render(
    <LinkWrapper>
      <Beer
        updateBeerIf={dontUpdateBeerIf}
        searchFieldIf={searchFieldIf}
        listReviewsByBeerIf={getListReviewsIf([])}
        listStoragesByBeerIf={listStoragesByBeerIf}
        reviewIf={reviewIf}
        getBeerIf={getBeerIf}
        useUrlPathParams={useUrlPathParams}
      />
    </LinkWrapper>,
  )

  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  const cancelButton = getByRole('button', { name: 'Cancel' })
  await user.click(cancelButton)
  getByRole('button', { name: 'Edit' })
})

test('render loading', async () => {
  const { getByText } = render(
    <LinkWrapper>
      <Beer
        updateBeerIf={dontUpdateBeerIf}
        searchFieldIf={searchFieldIf}
        listReviewsByBeerIf={getListReviewsIf([])}
        listStoragesByBeerIf={listStoragesByBeerIf}
        reviewIf={reviewIf}
        getBeerIf={{
          useGetBeer: () => ({
            beer: undefined,
            isLoading: true,
          }),
        }}
        useUrlPathParams={useUrlPathParams}
      />
    </LinkWrapper>,
  )
  getByText(loadingIndicatorText)
})

test('render not found', async () => {
  const { getByText } = render(
    <LinkWrapper>
      <Beer
        updateBeerIf={dontUpdateBeerIf}
        searchFieldIf={searchFieldIf}
        listReviewsByBeerIf={getListReviewsIf([])}
        listStoragesByBeerIf={listStoragesByBeerIf}
        reviewIf={reviewIf}
        getBeerIf={{
          useGetBeer: () => ({
            beer: undefined,
            isLoading: false,
          }),
        }}
        useUrlPathParams={useUrlPathParams}
      />
    </LinkWrapper>,
  )
  getByText('Not found')
})

test('load reviews', async () => {
  const useList = vitest.fn()
  render(
    <LinkWrapper>
      <Beer
        updateBeerIf={dontUpdateBeerIf}
        searchFieldIf={searchFieldIf}
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
        }}
        listStoragesByBeerIf={listStoragesByBeerIf}
        reviewIf={reviewIf}
        getBeerIf={getBeerIf}
        useUrlPathParams={useUrlPathParams}
      />
    </LinkWrapper>,
  )
  expect(useList.mock.calls).toEqual([
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
  const user = userEvent.setup()
  const setSearch = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <Beer
        updateBeerIf={dontUpdateBeerIf}
        searchFieldIf={searchFieldIf}
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
        }}
        listStoragesByBeerIf={listStoragesByBeerIf}
        reviewIf={reviewIf}
        getBeerIf={getBeerIf}
        useUrlPathParams={useUrlPathParams}
      />
    </LinkWrapper>,
  )
  const ratingButton = getByRole('button', { name: 'Rating' })
  await user.click(ratingButton)
  expect(setSearch.mock.calls).toEqual([
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
    <LinkWrapper>
      <Beer
        updateBeerIf={dontUpdateBeerIf}
        searchFieldIf={searchFieldIf}
        listReviewsByBeerIf={{
          useList: () => {
            return {
              reviews: undefined,
              isLoading: true,
            }
          },
          filterIf: listFilterIf(() => undefined),
        }}
        listStoragesByBeerIf={listStoragesByBeerIf}
        reviewIf={reviewIf}
        getBeerIf={getBeerIf}
        useUrlPathParams={useUrlPathParams}
      />
    </LinkWrapper>,
  )
  getByText(loadingIndicatorText)
})
