import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vitest } from "vitest"
import ReviewList from "./ReviewList"
import type { UseDebounce } from "../../core/types"
import type { Login } from "../../core/login/types"
import { Role } from "../../core/user/types"
import LinkWrapper from "../LinkWrapper"
import type { ReviewSorting, ReviewSortingOrder } from "../../core/review/types"

const useDebounce: UseDebounce = str => str

const dontCall = (): any => {
  throw new Error('must not be called')
}

const dontCreate = {
  create: dontCall,
  isLoading: false
}

const reviewedBeerId = '6ec1cde8-03aa-4567-bfac-b8509bc030cd'

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
  rating: reviewRating,
  smell: smellText,
  taste: 'Roasted malt, bitter, strong',
  time: dateStr
}

const anotherJoinedReview = {
  id: '40df563a-e3bb-46eb-b5c2-85a1b079ee74',
  additionalInfo: '',
  beerId: '911e1dbb-3c6a-4db5-a3eb-bac5b83a83fa',
  beerName: 'CCCCC IPA',
  breweries: [
    {
      id: 'fddab316-81a6-4d49-abc1-3e96e2b37442',
      name: 'Beer Hunters'
    }
  ],
  container: joinedReview.container,
  location: '',
  rating: 10,
  styles: [{
    id: '9e67df6d-3bde-4b5b-ba02-b17a9a743b49',
    name: 'american ipa'
  }],
  time: dateStr
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

const irrelevantSorting: ReviewSorting = {
  order: 'beer_name',
  direction: 'asc'
}

const irrelevantSupportedSorting: ReviewSortingOrder[] = ['beer_name']

test('updates review', async () => {
  const user = userEvent.setup()
  const onChanged = vitest.fn()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole, getByText } = render(
    <LinkWrapper>
      <ReviewList
        isLoading={false}
        isTitleVisible={true}
        sorting={irrelevantSorting}
        setSorting={() => undefined}
        supportedSorting={irrelevantSupportedSorting}
        reviews={[joinedReview]}
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
  expect(onChanged.mock.calls).toEqual([[]])
})

test('sets review sorting', async () => {
  const user = userEvent.setup()
  const setSorting = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <ReviewList
        isLoading={false}
        isTitleVisible={true}
        sorting={{
          order: 'beer_name',
          direction: 'desc'
        }}
        setSorting={setSorting}
        supportedSorting={['beer_name', 'brewery_name']}
        reviews={[joinedReview]}
        onChanged={dontCall}
        reviewIf={dontUpdateReviewIf}
        searchIf={searchIf}
      />
    </LinkWrapper>
  )
  getByRole('button', { name: 'Name ▼' })
  const breweriesButton = getByRole('button', { name: 'Breweries' })
  await user.click(breweriesButton)
  expect(setSorting.mock.calls).toEqual([[{
    order: 'brewery_name',
    direction: 'desc'
  }]])
})

test('renders reviews', async () => {
  const user = userEvent.setup()
  const { getByText, getByRole } = render(
    <LinkWrapper>
      <ReviewList
        isLoading={false}
        isTitleVisible={true}
        sorting={irrelevantSorting}
        setSorting={() => undefined}
        supportedSorting={irrelevantSupportedSorting}
        reviews={[joinedReview, anotherJoinedReview]}
        onChanged={dontCall}
        reviewIf={dontUpdateReviewIf}
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
  getByText(review.smell)
  getByText(review.taste)

  getByRole('link', { name: anotherJoinedReview.breweries[0].name })
  getByRole('link', { name: anotherJoinedReview.beerName })
  getByRole('link', { name: anotherJoinedReview.styles[0].name })
})

test('renders title', async () => {
  const { getByRole } = render(
    <LinkWrapper>
      <ReviewList
        isLoading={false}
        isTitleVisible={true}
        sorting={irrelevantSorting}
        setSorting={() => undefined}
        supportedSorting={irrelevantSupportedSorting}
        reviews={[joinedReview, anotherJoinedReview]}
        onChanged={dontCall}
        reviewIf={dontUpdateReviewIf}
        searchIf={searchIf}
      />
    </LinkWrapper>
  )
  getByRole('heading', { name: 'Reviews' })
})

test('does not render title', async () => {
  const { queryByRole } = render(
    <LinkWrapper>
      <ReviewList
        isLoading={false}
        isTitleVisible={false}
        sorting={irrelevantSorting}
        setSorting={() => undefined}
        supportedSorting={irrelevantSupportedSorting}
        reviews={[joinedReview, anotherJoinedReview]}
        onChanged={dontCall}
        reviewIf={dontUpdateReviewIf}
        searchIf={searchIf}
      />
    </LinkWrapper>
  )
  const heading = queryByRole('heading', { name: 'Reviews' })
  expect(heading).toEqual(null)
})
