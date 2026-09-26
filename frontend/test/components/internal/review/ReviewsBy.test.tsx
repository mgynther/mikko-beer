import { act, fireEvent, render } from '@testing-library/react'
import { setupUser } from '../../../user-event'
import { expect, test, vitest } from 'vitest'
import ReviewsBy from '../../../../src/components/internal/review/ReviewsBy'
import type {
  UseDebounce,
  YearMonth,
} from '../../../../src/components/types/types'
import type { Login } from '../../../../src/components/types/login/types'
import { Role } from '../../../../src/components/types/user/types'
import type {
  IdFilteredListReviewParams,
  JoinedReviewList,
  ListFilterIf,
  ListReviewsByIf,
  ReviewContainerIf,
  ReviewIf,
  SetSearch,
  UseListReviewsByResult,
} from '../../../../src/components/types/review/types'
import type {
  CreateBeerIf,
  SearchBeerIf,
  SelectBeerIf,
} from '../../../../src/components/types/beer/types'
import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import type { SearchLocationIf } from '../../../../src/components/types/location/types'
import { loadingIndicatorText } from '../../../../src/components/internal/common/LoadingIndicator'
import { testTimes } from '../../filter-time'
import { openFilters } from '../../open-filters'
import { dontCall } from '../../../dont-call'
import { testLink } from '../../link'
import { buildJoinedReview } from '../../types/review/builders'
import { buildLogin } from '../../types/login/builders'
import { buildUser } from '../../types/user/builders'

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
        searchFieldIf: {
          useSearchField: dontCall,
          useDebounce: dontCall,
        },
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

const joinedReview = buildJoinedReview()

const defaultUseListReviewsByResult: UseListReviewsByResult = {
  reviews: {
    reviews: [joinedReview],
    sorting: {
      order: 'time',
      direction: 'desc',
    },
  },
  isLoading: false,
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
  getLogin: () => adminLogin,
}

const adminLogin: Login = buildLogin({ user: buildUser({ role: Role.admin }) })

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
    <ReviewsBy
      linkComponent={testLink}
      id={id}
      listReviewsByIf={{
        useList: (params: IdFilteredListReviewParams) => {
          list(params)
          return { ...defaultUseListReviewsByResult }
        },
        filterIf: listFilterIf(setSearch),
        reviewIf: dontUpdateReviewIf,
      }}
    />,
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

test('lists reviews with search parameters', async () => {
  const list = vitest.fn()
  const id = '301b473a-218f-4058-af00-61664c991da9'
  const setSearch = vitest.fn()
  render(
    <ReviewsBy
      linkComponent={testLink}
      id={id}
      listReviewsByIf={{
        useList: (params: IdFilteredListReviewParams) => {
          list(params)
          return { ...defaultUseListReviewsByResult }
        },
        filterIf: {
          ...listFilterIf(setSearch),
          useUrlSearchParams: () => ({
            get: (param: string): string | undefined => {
              const values: Record<string, string> = {
                r_min_rating: '5',
                r_max_rating: '9',
                r_min_time: '2018-01',
                r_max_time: '2024-11',
                r_order: 'rating',
                r_direction: 'desc',
              }
              return values[param]
            },
          }),
        },
        reviewIf: dontUpdateReviewIf,
      }}
    />,
  )
  expect(list.mock.calls).toEqual([
    [
      {
        id,
        sorting: {
          direction: 'desc',
          order: 'rating',
        },
        filter: {
          minRating: 5,
          maxRating: 9,
          minTime: new Date('2018-01-01T00:00:00').getTime(),
          maxTime: new Date('2024-11-30T23:59:59').getTime(),
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

function getListReviewsByIf(
  setSearch: SetSearch,
  reviewIf: ReviewIf,
): ListReviewsByIf {
  return {
    useList: (
      _: IdFilteredListReviewParams,
    ): {
      reviews: JoinedReviewList | undefined
      isLoading: boolean
    } => {
      return { ...defaultUseListReviewsByResult }
    },
    filterIf: listFilterIf(setSearch),
    reviewIf,
  }
}

orderChangeTests.forEach((testCase) => {
  test(`change order from ${testCase.originalOrder} ${
    testCase.originalDirection
  } to ${testCase.newOrder} ${testCase.newDirection}`, async () => {
    const user = setupUser()
    const id = '4dbab81d-b353-4f0d-97b5-390967c24c19'
    const setSearch = vitest.fn()
    const searchParams: Record<string, string> = {
      ...defaultSearchParams,
      r_order: testCase.originalOrder,
      r_direction: testCase.originalDirection,
    }
    const listReviewsByIf: ListReviewsByIf = getListReviewsByIf(
      setSearch,
      dontUpdateReviewIf,
    )
    const { getByRole } = render(
      <ReviewsBy
        linkComponent={testLink}
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
      />,
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
    <ReviewsBy
      linkComponent={testLink}
      id={id}
      listReviewsByIf={{
        useList: () => {
          return {
            reviews: undefined,
            isLoading: true,
          }
        },
        filterIf: listFilterIf(() => undefined),
        reviewIf: dontUpdateReviewIf,
      }}
    />,
  )
  getByText(loadingIndicatorText)
})

test('opens filters', async () => {
  const user = setupUser()
  const setSearch = vitest.fn()
  const { getByRole } = render(
    <ReviewsBy
      linkComponent={testLink}
      id={'927ba184-4762-43d5-89f5-007e33ead51b'}
      listReviewsByIf={{
        useList: () => {
          return { ...defaultUseListReviewsByResult }
        },
        filterIf: listFilterIf(setSearch),
        reviewIf: dontUpdateReviewIf,
      }}
    />,
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
      <ReviewsBy
        linkComponent={testLink}
        id={'a9c672ff-c1c1-4abf-b45c-f2d263bab9ce'}
        listReviewsByIf={{
          useList: () => {
            return { ...defaultUseListReviewsByResult }
          },
          filterIf: {
            ...listFilterIf(setSearch),
            useUrlSearchParams: () => ({
              get: (key: string): string | undefined =>
                defaultFiltersOpenParams[key],
            }),
          },
          reviewIf: dontUpdateReviewIf,
        }}
      />,
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
