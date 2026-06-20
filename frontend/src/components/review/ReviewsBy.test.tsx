import { act, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import ReviewsBy from './ReviewsBy'
import type { UseDebounce, YearMonth } from '../../core/types'
import type { Login } from '../../core/login/types'
import { Role } from '../../core/user/types'
import LinkWrapper from '../LinkWrapper'
import type {
  IdFilteredListReviewParams,
  JoinedReviewList,
  ListFilterIf,
  ListReviewsByIf,
  ReviewContainerIf,
  ReviewIf,
  SetSearch,
} from '../../core/review/types'
import type {
  CreateBeerIf,
  SearchBeerIf,
  SelectBeerIf,
} from '../../core/beer/types'
import type { SearchFieldIf } from '../../core/search/types'
import type { SearchLocationIf } from '../../core/location/types'
import { loadingIndicatorText } from '../common/LoadingIndicator'
import { testTimes } from '../../../test-util/filter-time'
import { openFilters } from '../common/filters-test-util'
import { dontCall } from '../../../test-util/dont-call'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
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

const beerSearchIf: SearchBeerIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false,
  }),
  searchFieldIf,
}

const dontCreateBeerIf: CreateBeerIf = {
  useCreate: () => dontCreate,
  editBeerIf: {
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
          styles: undefined,
          isLoading: false,
        }),
      },
    },
  },
}

const reviewContainerIf: ReviewContainerIf = {
  createIf: {
    useCreate: () => dontCreate,
  },
  listIf: {
    useList: () => ({
      data: {
        containers: [],
      },
      isLoading: false,
    }),
  },
}

const selectBeerIf: SelectBeerIf = {
  create: dontCreateBeerIf,
  search: beerSearchIf,
}

const joinedReview = {
  id: 'f1f2157a-3bad-4a40-9da8-2da8c3f6d69b',
  additionalInfo: '',
  beerId: '22e2ee56-4eb0-48db-969c-a0ac57396b5e',
  beerName: 'Ikiurso',
  breweries: [
    {
      id: 'f00effc4-ddca-4100-95f6-9f2f3456256b',
      name: 'Panimo Hiisi',
    },
  ],
  container: {
    id: '705c2235-e957-4b2a-8994-a0c026c09bd3',
    type: 'bottle',
    size: '0.33',
  },
  location: undefined,
  rating: 9,
  styles: [
    {
      id: '65550e97-9d64-4692-804b-5b82131a71ff',
      name: 'imperial stout',
    },
  ],
  time: '2023-08-15T12:00:00.000Z',
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

const dontUpdateReviewIf: ReviewIf = {
  get: {
    useGet: () => ({
      get: dontCall,
    }),
  },
  update: {
    useUpdate: () => ({
      update: dontCall,
      isLoading: false,
    }),
    searchLocationIf,
    selectBeerIf,
    reviewContainerIf,
  },
  login: () => adminLogin,
}

const adminLogin: Login = {
  user: {
    id: '4b07d278-b705-4ea2-bc43-20ab95a5fba3',
    username: 'admin',
    role: Role.admin,
  },
  authToken: '',
  refreshToken: '',
}

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const listFilterIf: (setSearch: SetSearch) => ListFilterIf = (
  setSearch: SetSearch,
) => ({
  getUseDebounce,
  minTime,
  maxTime,
  setSearch,
  useUrlSearchParams: () => ({
    get: (): undefined => undefined,
  }),
})

test('lists reviews', async () => {
  const list = vitest.fn()
  const id = '833c90e2-e2c6-42c9-a1ee-a4454b42a302'
  const setSearch = vitest.fn()
  render(
    <LinkWrapper>
      <ReviewsBy
        id={id}
        listReviewsByIf={{
          useList: (params: IdFilteredListReviewParams) => {
            list(params)
            return {
              reviews: {
                reviews: [joinedReview],
                sorting: {
                  order: 'time',
                  direction: 'desc',
                },
              },
              isLoading: false,
            }
          },
          filterIf: listFilterIf(setSearch),
        }}
        reviewIf={dontUpdateReviewIf}
        searchFieldIf={searchFieldIf}
      />
    </LinkWrapper>,
  )
  expect(list.mock.calls).toEqual([
    [
      {
        id,
        sorting: {
          direction: 'asc',
          order: 'beer_name',
        },
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

interface OrderChangeTest {
  originalOrder: string
  originalDirection: string
  buttonText: string
  newOrder: string
  newDirection: string
}

const orderChangeTests: OrderChangeTest[] = [
  {
    originalOrder: 'time',
    originalDirection: 'desc',
    buttonText: 'Rating',
    newOrder: 'rating',
    newDirection: 'desc',
  },
  {
    originalOrder: 'time',
    originalDirection: 'desc',
    buttonText: 'Name',
    newOrder: 'beer_name',
    newDirection: 'asc',
  },
]

const defaultSearchParams: Record<string, string> = {
  r_direction: 'asc',
  r_filters: '0',
  r_max_rating: '10',
  r_max_time: '2024-12',
  r_min_rating: '4',
  r_min_time: '2017-12',
  r_order: 'beer_name',
}

function getListReviewsByIf(setSearch: SetSearch): ListReviewsByIf {
  return {
    useList: (
      _: IdFilteredListReviewParams,
    ): {
      reviews: JoinedReviewList | undefined
      isLoading: boolean
    } => {
      return {
        reviews: {
          reviews: [joinedReview],
          sorting: {
            order: 'time',
            direction: 'desc',
          },
        },
        isLoading: false,
      }
    },
    filterIf: listFilterIf(setSearch),
  }
}

orderChangeTests.forEach((testCase) => {
  test(`change order from ${testCase.originalOrder} ${
    testCase.originalDirection
  } to ${testCase.newOrder} ${testCase.newDirection}`, async () => {
    const user = userEvent.setup()
    const id = '4dbab81d-b353-4f0d-97b5-390967c24c19'
    const setSearch = vitest.fn()
    const searchParams: Record<string, string> = {
      ...defaultSearchParams,
      r_order: testCase.originalOrder,
      r_direction: testCase.originalDirection,
    }
    const listReviewsByIf: ListReviewsByIf = getListReviewsByIf(setSearch)
    const { getByRole } = render(
      <LinkWrapper>
        <ReviewsBy
          id={id}
          listReviewsByIf={{
            ...listReviewsByIf,
            filterIf: {
              ...listReviewsByIf.filterIf,
              useUrlSearchParams: () => ({
                get: (key: string): string | undefined => searchParams[key],
              }),
            },
          }}
          reviewIf={dontUpdateReviewIf}
          searchFieldIf={searchFieldIf}
        />
      </LinkWrapper>,
    )

    const ratingButton = getByRole('button', { name: testCase.buttonText })
    await user.click(ratingButton)
    expect(setSearch.mock.calls).toEqual([
      [
        {
          r_direction: testCase.originalDirection,
          r_filters: '0',
          r_max_rating: '10',
          r_max_time: '2024-12',
          r_min_rating: '4',
          r_min_time: '2017-12',
          r_order: testCase.originalOrder,
        },
      ],
      [
        {
          r_direction: testCase.newDirection,
          r_filters: '0',
          r_max_rating: '10',
          r_max_time: '2024-12',
          r_min_rating: '4',
          r_min_time: '2017-12',
          r_order: testCase.newOrder,
        },
      ],
    ])
  })
})

test('renders loading', async () => {
  const id = '919a59cf-1f8c-4d29-85c5-814655eaab80'
  const { getByText } = render(
    <LinkWrapper>
      <ReviewsBy
        id={id}
        listReviewsByIf={{
          useList: () => {
            return {
              reviews: undefined,
              isLoading: true,
            }
          },
          filterIf: listFilterIf(() => undefined),
        }}
        reviewIf={dontUpdateReviewIf}
        searchFieldIf={searchFieldIf}
      />
    </LinkWrapper>,
  )
  getByText(loadingIndicatorText)
})

test('opens filters', async () => {
  const user = userEvent.setup()
  const setSearch = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <ReviewsBy
        id={'927ba184-4762-43d5-89f5-007e33ead51b'}
        listReviewsByIf={{
          useList: () => {
            return {
              reviews: {
                reviews: [joinedReview],
                sorting: {
                  order: 'time',
                  direction: 'desc',
                },
              },
              isLoading: false,
            }
          },
          filterIf: listFilterIf(setSearch),
        }}
        reviewIf={dontUpdateReviewIf}
        searchFieldIf={searchFieldIf}
      />
    </LinkWrapper>,
  )
  await openFilters(getByRole, user)
  expect(setSearch).toHaveBeenCalledTimes(2)
  const filtersOpen = setSearch.mock.calls.map((args) => args[0].r_filters)
  expect(filtersOpen).toEqual(['0', '1'])
})

function changeSlider(
  getByLabelText: (str: string) => HTMLElement,
  from: string,
  to: string,
): void {
  const slider = getByLabelText(from)
  fireEvent.change(slider, { target: { value: to } })
}

interface SliderChangeTest {
  label: string
  toDisplayValue: string
  property: string
  stateValue: string
}

const sliderChangeTests: SliderChangeTest[] = [
  {
    label: 'Minimum rating: 4',
    toDisplayValue: '5',
    property: 'r_min_rating',
    stateValue: '5',
  },
  {
    label: 'Maximum rating: 10',
    toDisplayValue: '9',
    property: 'r_max_rating',
    stateValue: '9',
  },
  {
    label: 'Minimum time: 2017-12',
    toDisplayValue: '5',
    property: 'r_min_time',
    stateValue: '2018-05',
  },
  {
    label: 'Maximum time: 2024-12',
    toDisplayValue: '8',
    property: 'r_max_time',
    stateValue: '2018-08',
  },
]

const defaultFiltersOpenParams: Record<string, string> = {
  ...defaultSearchParams,
  r_filters: '1',
}

sliderChangeTests.forEach((testCase) => {
  test(`change ${testCase.property}`, async () => {
    const setSearch = vitest.fn()
    const { getByLabelText } = render(
      <LinkWrapper>
        <ReviewsBy
          id={'a9c672ff-c1c1-4abf-b45c-f2d263bab9ce'}
          listReviewsByIf={{
            useList: () => {
              return {
                reviews: {
                  reviews: [joinedReview],
                  sorting: {
                    order: 'time',
                    direction: 'desc',
                  },
                },
                isLoading: false,
              }
            },
            filterIf: {
              ...listFilterIf(setSearch),
              useUrlSearchParams: () => ({
                get: (key: string): string | undefined =>
                  defaultFiltersOpenParams[key],
              }),
            },
          }}
          reviewIf={dontUpdateReviewIf}
          searchFieldIf={searchFieldIf}
        />
      </LinkWrapper>,
    )
    await act(async () => {
      changeSlider(getByLabelText, testCase.label, testCase.toDisplayValue)
    })
    const expected = {
      ...defaultFiltersOpenParams,
    }
    expected[testCase.property] = testCase.stateValue
    expect(setSearch.mock.calls).toEqual([
      [defaultFiltersOpenParams],
      [expected],
    ])
  })
})
