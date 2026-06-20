import { act, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Reviews from './Reviews'
import type { UseDebounce, YearMonth } from '../../core/types'
import type { Login } from '../../core/login/types'
import { Role } from '../../core/user/types'
import LinkWrapper from '../LinkWrapper'
import type {
  JoinedReviewList,
  ListFilterIf,
  ListReviewParams,
  ListReviewsIf,
  Review,
  ReviewContainerIf,
  ReviewIf,
  SetSearch,
} from '../../core/review/types'
import ContentEnd from '../ContentEnd'
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

const reviewedBeerId = 'a562b38b-b9df-4cf6-be4a-e1179eb4e89a'

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

const dateStr = '2022-04-01T12:00:00.000Z'

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

const smellText = 'Very nice, caramel, hops'
const newTasteText = 'Very good, caramel, malt, bitter'

const reviewRating = 10

const reviewContainerId = '30d153af-1170-49a1-8b33-c96d789748a9'

const joinedReview = {
  id: '9b6c746a-5870-4572-ba46-9116d64b436a',
  additionalInfo: '',
  beerId: reviewedBeerId,
  beerName: 'Siperia',
  breweries: [
    {
      id: '54d41335-6ebb-4e07-8992-4c8e756850e4',
      name: 'Koskipanimo',
    },
  ],
  container: {
    id: reviewContainerId,
    type: 'bottle',
    size: '0.50',
  },
  location: undefined,
  rating: 9,
  styles: [
    {
      id: 'f83ac055-90b4-489c-b549-cee985262ef1',
      name: 'imperial stout',
    },
  ],
  time: dateStr,
}

const review = {
  id: joinedReview.id,
  additionalInfo: '',
  beer: reviewedBeerId,
  container: reviewContainerId,
  location: '',
  rating: reviewRating,
  smell: smellText,
  taste: 'Roasted malt, bitter, strong',
  time: dateStr,
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
  login: () => adminLogin,
}

const adminLogin: Login = {
  user: {
    id: 'cae333fe-8247-4b31-93af-f2218b20f63e',
    username: 'admin',
    role: Role.admin,
  },
  authToken: '',
  refreshToken: '',
}

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
  const user = userEvent.setup()
  const update = vitest.fn()
  let scrollCb: () => void = () => undefined
  const { getByPlaceholderText, getByRole, getByText } = render(
    <LinkWrapper>
      <Reviews
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
          login: () => adminLogin,
        }}
      />
      <ContentEnd />
    </LinkWrapper>,
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
      {
        id: joinedReview.id,
        additionalInfo: '',
        beer: reviewedBeerId,
        container: reviewContainerId,
        location: '',
        rating: reviewRating,
        smell: smellText,
        taste: newTasteText,
        time: dateStr,
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
  const user = userEvent.setup()
  const listParams = vitest.fn()
  const setSearch = vitest.fn()
  let scrollCb: () => void = () => undefined
  const listReviewsIf: ListReviewsIf = getListReviewsIf(listParams, setSearch)
  const { getByRole } = render(
    <LinkWrapper>
      <Reviews
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
    </LinkWrapper>,
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
    <LinkWrapper>
      <Reviews
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
    </LinkWrapper>,
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
    <LinkWrapper>
      <Reviews
        listReviewsIf={{
          useList: () => {
            return {
              list: async (params): Promise<JoinedReviewList> => {
                listMore(params)
                if (getListRequestCount() > 1) {
                  return {
                    reviews: [],
                    sorting: {
                      order: 'beer_name',
                      direction: 'asc',
                    },
                  }
                }
                return {
                  reviews: [joinedReview],
                  sorting: {
                    order: 'beer_name',
                    direction: 'asc',
                  },
                }
              },
              reviewList: {
                reviews: getListRequestCount() > 1 ? [] : [joinedReview],
                sorting: {
                  order: 'beer_name',
                  direction: 'asc',
                },
              },
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
    </LinkWrapper>,
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

test('opens filters', async () => {
  const user = userEvent.setup()
  const setSearch = vitest.fn()
  const listParams = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <Reviews
        listReviewsIf={{
          ...getListReviewsIf(listParams, setSearch),
          infiniteScroll: (): (() => undefined) => {
            return () => undefined
          },
        }}
        reviewIf={dontUpdateReviewIf}
      />
      <ContentEnd />
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
    const listParams = vitest.fn()
    const setSearch = vitest.fn()
    const listReviewsIf: ListReviewsIf = getListReviewsIf(listParams, setSearch)
    const { getByLabelText } = render(
      <LinkWrapper>
        <Reviews
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
