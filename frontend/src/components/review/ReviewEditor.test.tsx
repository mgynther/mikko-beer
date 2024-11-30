import { render, fireEvent } from "@testing-library/react"
import userEvent, { type UserEvent } from "@testing-library/user-event"
import { expect, test, vitest } from "vitest"
import ReviewEditor from "./ReviewEditor"
import type { UseDebounce } from "../../core/types"

const useDebounce: UseDebounce = str => str

const dontCall = (): any => {
  throw new Error('must not be called')
}

const dontCreate = {
  create: dontCall,
  isLoading: false
}

const reviewedBeerId = '76a4e30b-955b-4523-9955-9b60523f92d4'

const searchBeerId = '307334fc-bd6b-4782-9f5e-0cffb74d6d02'
const searchBeerName = 'Severin'
const beerSearchResult = {
  id: searchBeerId,
  name: searchBeerName,
  breweries: [{
    id: 'a990bf1b-266d-49fe-a4fd-a8fb1a1a93ee',
    name: 'Koskipanimo'
  }],
  styles: [{
    id: '875f7295-5583-490e-98c6-66deb3432c97',
    name: 'american ipa'
  }]
}

const beerSearchIf = {
  useSearch: () => ({
    search: async () => [beerSearchResult],
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

const newReviewContainerId = '2859186e-156f-41fe-b979-829eaed31276'
const containerListResult = {
  id: newReviewContainerId,
  type: 'draft',
  size: '0.25'
}

const dateStr ='2022-04-01T12:00:00.000Z'
const currentDate = new Date(dateStr)

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

const additionalInfoText = 'Very nice atmosphere here'
const locationText = 'Panimomestari Oluthuone, Tampere, Finland'
const smellText = 'Very nice, caramel, hops'
const tasteText = 'Very good, caramel, malt, bitter'

const reviewRating = 10

const reviewContainerId = 'b2cd8c37-cfab-4978-95c4-24898364ada4'

const joinedReview = {
  id: '4f5f97ae-a5a0-4ff6-9106-6a5cf8301fa1',
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
): Promise<void> {
  const additionalInfoInput = getByPlaceholderText('Additional info')
  additionalInfoInput.focus()
  await userEvent.paste(additionalInfoText)
  const locationInput = getByPlaceholderText('Location')
  locationInput.focus()
  await userEvent.paste(locationText)
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

test('adds review', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { findByRole, getAllByRole, getByPlaceholderText, getByRole } = render(
    <ReviewEditor
      currentDate={currentDate}
      initialReview={undefined}
      isFromStorage={false}
      onChange={onChange}
      reviewContainerIf={reviewContainerIf}
      searchIf={searchIf}
      selectBeerIf={selectBeerIf}
    />
  )

  const selects = getAllByRole('radio', { name: 'Select' })
  await user.click(selects[0])
  const beerSearch = getByPlaceholderText('Search beer')
  expect(beerSearch).toBeDefined()
  beerSearch.focus()
  await user.paste('Seve')
  const beerButton = await findByRole(
    'button',
    { name: 'Severin (Koskipanimo)' }
  )
  expect(beerButton).toBeDefined()
  await user.click(beerButton)
  getByRole('button', { name: 'Change' })
  const containerSelect = getByRole('combobox')
  await user.click(containerSelect)
  const draft = getByRole('option', { name: 'draft 0.25' })
  await userEvent.selectOptions(containerSelect, draft)
  await user.click(draft)
  await addReview(getByPlaceholderText, getByRole, user)
  const filteredChanged =
    onChange.mock.calls.filter(params => params[0] !== undefined)
  expect(filteredChanged).toEqual([[{
    additionalInfo: additionalInfoText,
    beer: searchBeerId,
    container: newReviewContainerId,
    location: locationText,
    rating: reviewRating,
    smell: smellText,
    taste: tasteText,
    time: dateStr
  }]])
})

test('updates review', async () => {
  const user = userEvent.setup()
  const onChange = vitest.fn()
  const { getAllByRole, getByPlaceholderText, getByRole } = render(
    <ReviewEditor
      currentDate={currentDate}
      initialReview={{
        joined: joinedReview,
        review
      }}
      isFromStorage={false}
      onChange={onChange}
      reviewContainerIf={reviewContainerIf}
      searchIf={searchIf}
      selectBeerIf={selectBeerIf}
    />
  )
  const changeButtons = getAllByRole('button', { name: 'Change' })
  expect(changeButtons.length).toEqual(2)
  await addReview(getByPlaceholderText, getByRole, user)
  const finalChange = onChange.mock.calls[onChange.mock.calls.length - 1]
  expect(finalChange).toEqual([{
    additionalInfo: additionalInfoText,
    beer: reviewedBeerId,
    container: reviewContainerId,
    location: locationText,
    rating: reviewRating,
    smell: smellText,
    taste: tasteText,
    time: dateStr
  }])
})

test('cannot change beer or container when from storage', () => {
  const { queryAllByRole } = render(
    <ReviewEditor
      currentDate={currentDate}
      initialReview={{
        joined: joinedReview,
        review
      }}
      isFromStorage={true}
      onChange={() => undefined}
      reviewContainerIf={reviewContainerIf}
      searchIf={searchIf}
      selectBeerIf={selectBeerIf}
    />
  )
  const changeButtons = queryAllByRole('button', { name: 'Change' })
  expect(changeButtons.length).toEqual(0)
})
