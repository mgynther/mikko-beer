import { act, render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vitest } from "vitest"
import Reviews from "./Reviews"
import type { UseDebounce } from "../../core/types"
import type { Login } from "../../core/login/types"
import { Role } from "../../core/user/types"
import LinkWrapper from "../LinkWrapper"
import type {
  JoinedReviewList,
  ListReviewParams,
  ListReviewsIf,
  Review,
  ReviewContainerIf,
  ReviewIf
} from "../../core/review/types"
import ContentEnd from "../ContentEnd"
import type {
  CreateBeerIf,
  SearchBeerIf,
  SelectBeerIf
} from "../../core/beer/types"
import type { SearchIf } from "../../core/search/types"
import type { SearchLocationIf } from "../../core/location/types"
import { loadingIndicatorText } from "../common/LoadingIndicator"

const useDebounce: UseDebounce<string> = str => [str, false]

const dontCall = (): any => {
  throw new Error('must not be called')
}

const dontCreate = {
  create: dontCall,
  isLoading: false
}

const reviewedBeerId = 'a562b38b-b9df-4cf6-be4a-e1179eb4e89a'

const beerSearchIf: SearchBeerIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false
  })
}
const dontCreateBeerIf: CreateBeerIf = {
  useCreate: () => dontCreate,
  editBeerIf: {
    selectBreweryIf: {
      create: {
        useCreate: () => dontCreate
      },
      search: {
        useSearch: () => ({
          search: dontCall,
          isLoading: false
        })
      }
    },
    selectStyleIf: {
      create: {
        useCreate: () => ({
          ...dontCreate,
          createdStyle: undefined,
          hasError: false,
          isSuccess: false
        })
      },
      list: {
        useList: () => ({
          styles: undefined,
          isLoading: false,
        })
      }
    }
  }
}

const dateStr ='2022-04-01T12:00:00.000Z'

const reviewContainerIf: ReviewContainerIf = {
  createIf: {
    useCreate: () => dontCreate
  },
  listIf: {
    useList: () => ({
      data: {
        containers: []
      },
      isLoading: false
    })
  }
}

const searchIf: SearchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true
  }),
  useDebounce
}
const selectBeerIf: SelectBeerIf = {
  create: dontCreateBeerIf,
  search: beerSearchIf
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
      name: 'Koskipanimo'
    }
  ],
  container: {
    id: reviewContainerId,
    type: 'bottle',
    size: '0.50'
  },
  location: undefined,
  rating: 9,
  styles: [{
    id: 'f83ac055-90b4-489c-b549-cee985262ef1',
    name: 'imperial stout'
  }],
  time: dateStr
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
  time: dateStr
}

const searchLocationIf: SearchLocationIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false
  }),
  create: {
    useCreate: () => ({
      create: dontCall,
      isLoading: false
    })
  }
}

const dontUpdateReviewIf: ReviewIf = {
  get: {
    useGet: () => ({
      get: async () => review
    })
  },
  update: {
    useUpdate: () => ({
      update: dontCall,
      isLoading: false
    }),
    searchLocationIf,
    selectBeerIf,
    reviewContainerIf
  },
  login: () => adminLogin
}

const adminLogin: Login = {
  user: {
    id: 'cae333fe-8247-4b31-93af-f2218b20f63e',
    username: 'admin',
    role: Role.admin
  },
  authToken: "",
  refreshToken: ""
}

type GetListReviewsIfCb = (params: ListReviewParams) => void
type GetListReviewsIf = (cb: GetListReviewsIfCb) => ListReviewsIf

const getListReviewsIf: GetListReviewsIf = cb => ({
  useList: () => ({
    list: async (params): Promise<JoinedReviewList> => {
      cb(params)
      return {
        reviews: [joinedReview],
        sorting: {
          order: 'rating',
          direction: 'desc'
        }
      }
    },
    reviewList: {
      reviews: [joinedReview],
      sorting: {
        order: 'rating',
        direction: 'desc'
      }
    },
    isLoading: false,
    isUninitialized: true
  }),
  infiniteScroll: dontCall
})

test('updates review', async () => {
  const user = userEvent.setup()
  const update = vitest.fn()
  let scrollCb: (() => void) = () => undefined
  const { getByPlaceholderText, getByRole, getByText } = render(
    <LinkWrapper>
      <Reviews
        listReviewsIf={{
          ...getListReviewsIf(() => undefined),
          infiniteScroll: (
            cb
          ): () => undefined => { scrollCb = cb; return () => undefined }
        }}
        reviewIf={{
          get: {
            useGet: () => ({
              get: async (): Promise<Review> => review
            })
          },
          update: {
            useUpdate: () => ({
              update,
              isLoading: false
            }),
            searchLocationIf,
            selectBeerIf,
            reviewContainerIf
          },
          login: () => adminLogin
        }}
        searchIf={searchIf}
      />
      <ContentEnd/>
    </LinkWrapper>
  )
  expect(scrollCb).not.toEqual(undefined)
  await act(async () => { scrollCb(); })
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
  expect(update.mock.calls).toEqual([[{
    id: joinedReview.id,
    additionalInfo: '',
    beer: reviewedBeerId,
    container: reviewContainerId,
    location: '',
    rating: reviewRating,
    smell: smellText,
    taste: newTasteText,
    time: dateStr
  }]])
})

test('sets review sorting', async () => {
  const user = userEvent.setup()
  const listParams = vitest.fn()
  let scrollCb: (() => void) = () => undefined
  const { getByRole } = render(
    <LinkWrapper>
      <Reviews
        listReviewsIf={{
          ...getListReviewsIf(listParams),
          infiniteScroll: (
            cb
          ): () => undefined => { scrollCb = cb; return () => undefined }
        }}
        reviewIf={dontUpdateReviewIf}
        searchIf={searchIf}
      />
      <ContentEnd/>
    </LinkWrapper>
  )
  expect(scrollCb).not.toEqual(undefined)
  await act(async () => { scrollCb(); })
  getByRole('button', { name: 'Rating ▼' })
  const timeButton = getByRole('button', { name: 'Time' })
  await user.click(timeButton)
  expect(listParams.mock.calls).toEqual([[{
    pagination: {
      size: 20,
      skip: 0,
    },
    sorting: {
      direction: 'desc',
      order: 'time'
    }
  }]])
})

test('renders loading', async () => {
  let scrollCb: (() => void) = () => undefined
  const { getByText } = render(
    <LinkWrapper>
      <Reviews
        listReviewsIf={{
          useList: () => ({
            list: async (): Promise<JoinedReviewList> => ({
              reviews: [],
              sorting: {
                order: 'beer_name',
                direction: 'asc'
              }
            }),
            reviewList: undefined,
            isLoading: true,
            isUninitialized: true
          }),
          infiniteScroll: (
            cb
          ): () => undefined => { scrollCb = cb; return () => undefined }
        }}
        reviewIf={dontUpdateReviewIf}
        searchIf={searchIf}
      />
      <ContentEnd/>
    </LinkWrapper>
  )
  scrollCb()
  getByText(loadingIndicatorText)
})

test('stops loading more', async () => {
  const listMore = vitest.fn()
  let scrollCb: (() => void) = () => undefined
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
                      direction: 'asc'
                    }
                  }
                }
                return {
                  reviews: [joinedReview],
                  sorting: {
                    order: 'beer_name',
                    direction: 'asc'
                  }
                }
              },
              reviewList: {
                reviews: getListRequestCount() > 1 ? [] : [joinedReview],
                sorting: {
                  order: 'beer_name',
                  direction: 'asc'
                }
              },
              isLoading: false,
              isUninitialized: false
            }
          },
          infiniteScroll: (
            cb
          ): () => undefined => { scrollCb = cb; return () => undefined }
        }}
        reviewIf={dontUpdateReviewIf}
        searchIf={searchIf}
      />
      <ContentEnd/>
    </LinkWrapper>
  )
  scrollCb()
  await waitFor(() => getByText(joinedReview.beerName))
  // No more visible changes on UI so act is needed.
  await act(async () => { scrollCb(); })
  expect(listMore.mock.calls).toEqual([
    [
      {
        pagination: {
          size: 20,
          skip: 0
        },
        sorting: {
          direction: 'desc',
          order: 'time'
        },
      }
    ],
    [
      {
        pagination: {
          size: 20,
          skip: 1
        },
        sorting: {
          direction: 'desc',
          order: 'time'
        },
      }
    ]
  ])
  await act(async () => { scrollCb(); })
  expect(listMore).toHaveBeenCalledTimes(2)
})
