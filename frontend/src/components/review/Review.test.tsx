import { render, fireEvent } from "@testing-library/react"
import userEvent, { type UserEvent } from "@testing-library/user-event"
import { expect, test, vitest } from "vitest"
import Review from "./Review"
import type { UseDebounce } from "../../core/types"
import type { Login } from "../../core/login/types"
import { Role } from "../../core/user/types"
import LinkWrapper from "../LinkWrapper"

const useDebounce: UseDebounce = (str: string) => str

const dontCall = (): any => {
  throw new Error('must not be called')
}

const dontCreate = {
  create: dontCall,
  isLoading: false
}

const reviewedBeerId = '8c7f4094-09ba-4ba9-aaa5-56099b1f5bbb'

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

const newReviewContainerId = '90c1bbac-3b19-42f9-9e49-e0ab4f7f9bb8'
const containerListResult = {
  id: newReviewContainerId,
  type: 'draft',
  size: '0.25'
}

const dateStr ='2022-04-01T12:00:00.000Z'

const reviewContainerIf = {
  createIf: {
    useCreate: () => dontCreate
  },
  listIf: {
    useList: () => ({
      data: {
        containers: [containerListResult]
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
const tasteText = 'Very good, caramel, malt, bitter'

const reviewRating = 10

const reviewContainerId = '2800eea5-e4ab-49fe-84cd-bf320a70383d'

const joinedReview = {
  id: 'a2b1bef8-717c-4323-979c-cf220745666c',
  additionalInfo: '',
  beerId: reviewedBeerId,
  beerName: 'Siperia',
  breweries: [
    {
      id: 'dd236932-aba3-488e-a685-e99a8e7c8972',
      name: 'Koskipanimo'
    }
  ],
  container: {
    id: reviewContainerId,
    type: 'bottle',
    size: '0.50'
  },
  location: '',
  rating: 9,
  styles: [{
    id: '30aad2a4-1f46-4f99-be9e-5b4d8bfa9bda',
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
  rating: 9,
  smell: 'Nice',
  taste: 'Roasted malt, bitter, strong',
  time: dateStr
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

const viewerLogin: Login = {
  user: {
    id: 'cae333fe-8247-4b31-93af-f2218b20f63e',
    username: 'viewer',
    role: Role.viewer
  },
  authToken: "",
  refreshToken: ""
}

async function addReview(getByPlaceholderText: (
  text: string) => HTMLElement,
  getByRole: (text: string, props?: Record<string, unknown>) => HTMLElement,
  user: UserEvent
): Promise<void> {
  const smellInput = getByPlaceholderText('Smell')
  smellInput.focus()
  await user.clear(smellInput)
  await userEvent.paste(smellText)
  const ratingInput = getByRole('slider')
  ratingInput.click()
  fireEvent.change(ratingInput, {target: {value: `${reviewRating}`}})
  const tasteInput = getByPlaceholderText('Taste')
  tasteInput.focus()
  await user.clear(tasteInput)
  await user.paste(tasteText)
}

test('updates review', async () => {
  const user = userEvent.setup()
  const onChanged = vitest.fn()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole, getByText } = render(
    <LinkWrapper>
      <Review
        review={joinedReview}
        onChanged={onChanged}
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
            selectBeerIf,
            reviewContainerIf
          },
          login: () => adminLogin
        }}
        searchIf={searchIf}
      />
    </LinkWrapper>
  )
  const beerName = getByText(joinedReview.beerName)
  await user.click(beerName)
  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  await addReview(getByPlaceholderText, getByRole, user)
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
    taste: tasteText,
    time: dateStr
  }]])
  expect(onChanged.mock.calls).toEqual([[]])
})

test('cannot update review as viewer', async () => {
  const user = userEvent.setup()
  const onChanged = vitest.fn()
  const update = vitest.fn()
  const { getByText, queryByRole } = render(
    <LinkWrapper>
      <Review
        review={joinedReview}
        onChanged={onChanged}
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
            selectBeerIf,
            reviewContainerIf
          },
          login: () => viewerLogin
        }}
        searchIf={searchIf}
      />
    </LinkWrapper>
  )
  const beerName = getByText(joinedReview.beerName)
  await user.click(beerName)
  const editButton = queryByRole('button', { name: 'Edit' })
  expect(editButton).toEqual(null)
})

test('renders review', async () => {
  const user = userEvent.setup()
  const additionalInfo = 'Additional info'
  const location = 'Oluthuone'
  const onChanged = vitest.fn()
  const update = vitest.fn()
  const { getByText, getByRole } = render(
    <LinkWrapper>
      <Review
        review={{
          ...joinedReview,
          additionalInfo,
          location
        }}
        onChanged={onChanged}
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
            selectBeerIf,
            reviewContainerIf
          },
          login: () => viewerLogin
        }}
        searchIf={searchIf}
      />
    </LinkWrapper>
  )
  const beerName = getByText(joinedReview.beerName)
  await user.click(beerName)
  getByRole('link', { name: joinedReview.breweries[0].name })
  getByRole('link', { name: joinedReview.beerName })
  getByRole('link', { name: joinedReview.styles[0].name })
  getByText(joinedReview.rating)
  getByText(joinedReview.time.split('T')[0])
  getByText(`${joinedReview.container.type} ${joinedReview.container.size}`)
  getByText(additionalInfo)
  getByText(location)
  getByText(review.smell)
  getByText(review.taste)
})
