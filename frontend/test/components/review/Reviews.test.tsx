import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { setupUser } from '../../user-event'
import { expect, test, vitest } from 'vitest'
import Reviews from '../../../src/components/review/Reviews'
import type {
  UseDebounce,
  YearMonth,
} from '../../../src/components/types/types'
import { Role } from '../../../src/components/types/user/types'
import type {
  JoinedReviewList,
  ListFilterIf,
  ListReviewParams,
  ListReviewsIf,
  Review,
  ReviewContainerIf,
  ReviewIf,
  SetSearch,
} from '../../../src/components/types/review/types'
import ContentEnd from '../../../src/components/ContentEnd'
import type {
  CreateBeerIf,
  SearchBeerIf,
  SelectBeerIf,
} from '../../../src/components/types/beer/types'
import type { SearchFieldIf } from '../../../src/components/types/search/types'
import type { SearchLocationIf } from '../../../src/components/types/location/types'
import { loadingIndicatorText } from '../../../src/components/internal/common/LoadingIndicator'
import { testTimes } from '../filter-time'
import { openFilters } from '../open-filters'
import { dontCall } from '../../dont-call'
import { buildLogin } from '../types/login/builders'
import { buildJoinedReview, buildReview } from '../types/review/builders'
import { buildUser } from '../types/user/builders'
import { testLink } from '../link'

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

const newTasteText = 'Very good, caramel, malt, bitter'

const joinedReview = buildJoinedReview({
  beerName: 'Siperia',
  location: undefined,
})

// The editor works in whole minutes, so a time without seconds is saved as it
// was loaded.
const review = buildReview({ time: '2022-04-01T12:00:00.000Z' })

const defaultReviewList: JoinedReviewList = {
  reviews: [joinedReview],
  sorting: {
    order: 'beer_name',
    direction: 'asc',
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
  searchFieldIf,
}

const dontUpdateReviewIf: ReviewIf = {
  get: {
    useGet: () => ({
      get: async () => review,
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

const adminLogin = buildLogin({ user: buildUser({ role: Role.admin }) })

type GetListReviewsIfCb = (params: ListReviewParams) => void
type GetListReviewsIf = (
  cb: GetListReviewsIfCb,
  setSearch: SetSearch,
) => ListReviewsIf

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

const getListReviewsIf: GetListReviewsIf = (cb, setSearch) => ({
  useList: () => ({
    list: async (params): Promise<JoinedReviewList> => {
      cb(params)
      return {
        reviews: [joinedReview],
        sorting: {
          order: 'rating',
          direction: 'desc',
        },
      }
    },
    reviewList: {
      reviews: [joinedReview],
      sorting: {
        order: 'rating',
        direction: 'desc',
      },
    },
    isLoading: false,
    isUninitialized: true,
  }),
  infiniteScroll: dontCall,
  filterIf: listFilterIf(setSearch),
})

test('updates review', async () => {
  const user = setupUser()
  const update = vitest.fn()
  let scrollCb: () => void = () => undefined
  const { getByPlaceholderText, getByRole, getByText } = render(
    <>
      <Reviews
        linkComponent={testLink}
        listReviewsIf={{
          ...getListReviewsIf(
            () => undefined,
            () => undefined,
          ),
          infiniteScroll: (cb): (() => undefined) => {
            scrollCb = cb
            return () => undefined
          },
        }}
        reviewIf={{
          get: {
            useGet: () => ({
              get: async (): Promise<Review> => review,
            }),
          },
          update: {
            useUpdate: () => ({
              update,
              isLoading: false,
            }),
            searchLocationIf,
            selectBeerIf,
            reviewContainerIf,
          },
          getLogin: () => adminLogin,
        }}
      />
      <ContentEnd />
    </>,
  )
  expect(scrollCb).not.toEqual(undefined)
  await act(async () => {
    scrollCb()
  })
  const beerName = getByText(joinedReview.beerName)
  await user.click(beerName)
  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)

  const tasteInput = getByPlaceholderText('Taste')
  tasteInput.focus()
  await user.clear(tasteInput)
  await user.paste(newTasteText)

  const saveButton = getByRole('button', { name: 'Save' })
  await user.click(saveButton)
  expect(update.mock.calls).toEqual([
    [
      // The beer, the container and the location are those of the review as
      // it is shown, everything else is the review as it was loaded.
      {
        id: joinedReview.id,
        additionalInfo: review.additionalInfo,
        beer: joinedReview.beerId,
        container: joinedReview.container.id,
        location: '',
        rating: review.rating,
        smell: review.smell,
        taste: newTasteText,
        time: review.time,
      },
    ],
  ])
})

const defaultSearchParams: Record<string, string> = {
  r_direction: 'desc',
  r_filters: '0',
  r_max_rating: '10',
  r_max_time: '2024-12',
  r_min_rating: '4',
  r_min_time: '2017-12',
  r_order: 'rating',
}

test('sets review sorting to rating asc', async () => {
  const user = setupUser()
  const listParams = vitest.fn()
  const setSearch = vitest.fn()
  let scrollCb: () => void = () => undefined
  const listReviewsIf: ListReviewsIf = getListReviewsIf(listParams, setSearch)
  const { getByRole } = render(
    <>
      <Reviews
        linkComponent={testLink}
        listReviewsIf={{
          ...listReviewsIf,
          filterIf: {
            ...listReviewsIf.filterIf,
            useUrlSearchParams: () => ({
              get: (key: string): string | undefined =>
                defaultSearchParams[key],
            }),
          },
          infiniteScroll: (cb): (() => undefined) => {
            scrollCb = cb
            return () => undefined
          },
        }}
        reviewIf={dontUpdateReviewIf}
      />
      <ContentEnd />
    </>,
  )
  expect(scrollCb).not.toEqual(undefined)
  await act(async () => {
    scrollCb()
  })
  const ratingButton = getByRole('button', { name: 'Rating ▼' })
  await user.click(ratingButton)
  expect(setSearch.mock.calls).toEqual([
    [defaultSearchParams],
    [
      {
        ...defaultSearchParams,
        r_order: 'rating',
        r_direction: 'asc',
      },
    ],
  ])
})

test('renders loading', async () => {
  let scrollCb: () => void = () => undefined
  const { getByText } = render(
    <>
      <Reviews
        linkComponent={testLink}
        listReviewsIf={{
          useList: () => ({
            list: async (): Promise<JoinedReviewList> => ({
              reviews: [],
              sorting: {
                order: 'beer_name',
                direction: 'asc',
              },
            }),
            reviewList: undefined,
            isLoading: true,
            isUninitialized: true,
          }),
          infiniteScroll: (cb): (() => undefined) => {
            scrollCb = cb
            return () => undefined
          },
          filterIf: listFilterIf(() => undefined),
        }}
        reviewIf={dontUpdateReviewIf}
      />
      <ContentEnd />
    </>,
  )
  scrollCb()
  getByText(loadingIndicatorText)
})

test('stops loading more', async () => {
  const listMore = vitest.fn()
  let scrollCb: () => void = () => undefined
  function getListRequestCount(): number {
    return listMore.mock.calls.length
  }
  const { getByText } = render(
    <>
      <Reviews
        linkComponent={testLink}
        listReviewsIf={{
          useList: () => {
            return {
              list: async (params): Promise<JoinedReviewList> => {
                listMore(params)
                if (getListRequestCount() > 1) {
                  return { ...defaultReviewList, reviews: [] }
                }
                return defaultReviewList
              },
              reviewList:
                getListRequestCount() > 1
                  ? { ...defaultReviewList, reviews: [] }
                  : defaultReviewList,
              isLoading: false,
              isUninitialized: false,
            }
          },
          infiniteScroll: (cb): (() => undefined) => {
            scrollCb = cb
            return () => undefined
          },
          filterIf: listFilterIf(() => undefined),
        }}
        reviewIf={dontUpdateReviewIf}
      />
      <ContentEnd />
    </>,
  )
  // act is important to ensure changes have been fully applied. loading is not
  // toggled between renders so without act there would be a race condition in
  // the test execution.
  await act(async () => {
    scrollCb()
  })
  await waitFor(() => getByText(joinedReview.beerName))
  await act(async () => {
    scrollCb()
  })
  expect(listMore.mock.calls).toEqual([
    [
      {
        pagination: {
          size: 20,
          skip: 0,
        },
        sorting: {
          direction: 'desc',
          order: 'time',
        },
        filter: {
          minRating: 4,
          maxRating: 10,
          minTime: testTimes.min.utcTimestamp,
          maxTime: testTimes.max.utcTimestamp,
        },
      },
    ],
    [
      {
        pagination: {
          size: 20,
          skip: 1,
        },
        sorting: {
          direction: 'desc',
          order: 'time',
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
  await act(async () => {
    scrollCb()
  })
  expect(listMore).toHaveBeenCalledTimes(2)
})

test('lists reviews with search parameters', async () => {
  const listMore = vitest.fn()
  let scrollCb: () => void = () => undefined
  render(
    <>
      <Reviews
        linkComponent={testLink}
        listReviewsIf={{
          useList: () => ({
            list: async (params): Promise<JoinedReviewList> => {
              listMore(params)
              return defaultReviewList
            },
            reviewList: defaultReviewList,
            isLoading: false,
            isUninitialized: false,
          }),
          infiniteScroll: (cb): (() => undefined) => {
            scrollCb = cb
            return () => undefined
          },
          filterIf: {
            ...listFilterIf(() => undefined),
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
        }}
        reviewIf={dontUpdateReviewIf}
      />
      <ContentEnd />
    </>,
  )
  await act(async () => {
    scrollCb()
  })
  expect(listMore.mock.calls).toEqual([
    [
      {
        pagination: {
          size: 20,
          skip: 0,
        },
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

test('opens filters', async () => {
  const user = setupUser()
  const setSearch = vitest.fn()
  const listParams = vitest.fn()
  const { getByRole } = render(
    <>
      <Reviews
        linkComponent={testLink}
        listReviewsIf={{
          ...getListReviewsIf(listParams, setSearch),
          infiniteScroll: (): (() => undefined) => {
            return () => undefined
          },
        }}
        reviewIf={dontUpdateReviewIf}
      />
      <ContentEnd />
    </>,
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
    const listParams = vitest.fn()
    const setSearch = vitest.fn()
    const listReviewsIf: ListReviewsIf = getListReviewsIf(listParams, setSearch)
    const { getByLabelText } = render(
      <>
        <Reviews
          linkComponent={testLink}
          listReviewsIf={{
            ...listReviewsIf,
            filterIf: {
              ...listReviewsIf.filterIf,
              useUrlSearchParams: () => ({
                get: (key: string): string | undefined =>
                  defaultFiltersOpenParams[key],
              }),
            },
            infiniteScroll: (): (() => undefined) => {
              return () => undefined
            },
          }}
          reviewIf={dontUpdateReviewIf}
        />
        <ContentEnd />
      </>,
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
