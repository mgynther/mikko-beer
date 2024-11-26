import { render, fireEvent } from "@testing-library/react"
import userEvent, { type UserEvent } from "@testing-library/user-event"
import { expect, test, vitest } from "vitest"
import UpdateReview from "./UpdateReview"
import type { UseDebounce } from "../../core/types"

const useDebounce: UseDebounce = (str: string) => str

const dontCall = () => {
  throw new Error('must not be called')
}

const dontCreate = {
  create: dontCall,
  isLoading: false
}

const reviewedBeerId = '8d3463b8-0942-4f51-ad3b-619e23a4ba07'

const searchBeerId = 'f49f41b6-4a8b-473d-ab31-d0a69eaf6fc2'
const searchBeerName = 'Severin'
const beerSearchResult = {
  id: searchBeerId,
  name: searchBeerName,
  breweries: [{
    id: 'cfceef11-215f-4277-928e-b3383d952f3f',
    name: 'Koskipanimo'
  }],
  styles: [{
    id: 'dc27712a-a74b-4cd8-8ea2-14e0f81f50ff',
    name: 'american ipa'
  }]
}

const beerSearchIf = {
  useSearch: () => ({
    search: async () => {
      return [beerSearchResult]
    },
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

const newReviewContainerId = 'f69b6af4-c267-49af-ada0-07137f22b740'
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
    activate: () => { },
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

const reviewContainerId = '609c0289-0dd8-454f-8c2e-92b32f9fad86'

const joinedReview = {
  id: 'f71bc3ea-2f76-4770-afdb-cfa8870d3a86',
  additionalInfo: '',
  beerId: reviewedBeerId,
  beerName: 'Siperia',
  breweries: [],
  container: {
    id: reviewContainerId,
    type: 'bottle',
    size: '0.50'
  },
  location: '',
  rating: 9,
  styles: [],
  time: dateStr
}
const review = {
  additionalInfo: '',
  beer: reviewedBeerId,
  container: reviewContainerId,
  location: '',
  rating: 9,
  smell: 'Nice',
  taste: 'Roasted malt, bitter, strong',
  time: dateStr
}

async function addReview(getByPlaceholderText: (
  text: string) => HTMLElement,
  getByRole: (text: string, props?: Record<string, unknown>) => HTMLElement,
  user: UserEvent
) {
  const smellInput = getByPlaceholderText('Smell')
  smellInput.focus()
  user.clear(smellInput)
  userEvent.paste(smellText)
  const ratingInput = getByRole('slider')
  ratingInput.click()
  fireEvent.change(ratingInput, {target: {value: `${reviewRating}`}})
  const tasteInput = getByPlaceholderText('Taste')
  tasteInput.focus()
  user.clear(tasteInput)
  await user.paste(tasteText)
}

test('updates review', async () => {
  const user = userEvent.setup()
  const onSaved = vitest.fn()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <UpdateReview
      initialReview={{
        joined: joinedReview,
        review
      }}
      onSaved={onSaved}
      updateReviewIf={{
        useUpdate: () => ({
          update: update,
          isLoading: false
        }),
        selectBeerIf,
        reviewContainerIf
      }}
      searchIf={searchIf}
      onCancel={dontCall}
    />
  )
  await addReview(getByPlaceholderText, getByRole, user);
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
  expect(onSaved.mock.calls).toEqual([[]])
})

test('cancels update', async () => {
  const user = userEvent.setup()
  const onCancel = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <UpdateReview
      initialReview={{
        joined: joinedReview,
        review
      }}
      onSaved={dontCall}
      updateReviewIf={{
        useUpdate: () => ({
          update: dontCall,
          isLoading: false
        }),
        selectBeerIf,
        reviewContainerIf
      }}
      searchIf={searchIf}
      onCancel={onCancel}
    />
  )
  await addReview(getByPlaceholderText, getByRole, user);
  const cancelButton = getByRole('button', { name: 'Cancel' })
  await user.click(cancelButton)
  expect(onCancel.mock.calls).toEqual([[]])
})
