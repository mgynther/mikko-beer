import { act, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vitest } from "vitest"
import Reviews from "./Reviews"
import type { UseDebounce } from "../../core/types"
import type { Login } from "../../core/login/types"
import { Role } from "../../core/user/types"
import LinkWrapper from "../LinkWrapper"
import type { ListReviewParams, ListReviewsIf } from "../../core/review/types"
import ContentEnd from "../ContentEnd"

const useDebounce: UseDebounce = str => str

const dontCall = (): any => {
  throw new Error('must not be called')
}

const dontCreate = {
  create: dontCall,
  isLoading: false
}

const reviewedBeerId = 'a562b38b-b9df-4cf6-be4a-e1179eb4e89a'

const beerSearchIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false
  })
}
const dontCreateBeerIf = {
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

const reviewContainerIf = {
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

const searchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true
  }),
  useDebounce
}
const selectBeerIf = {
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

const searchLocationIf = {
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

const dontUpdateReviewIf = {
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
    list: async (params) => {
      cb(params)
      return {
        reviews: [joinedReview]
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
          infiniteScroll: (cb) => { scrollCb = cb; return () => undefined }
        }}
        reviewIf={{
          get: {
            useGet: () => ({
              get: async () => review
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
          infiniteScroll: (cb) => { scrollCb = cb; return () => undefined }
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
