import { test } from '../../../test'
import { assertDeepEqual, assertDefined, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import type { RenderResult } from '../../../render'
import { fireEvent } from '../../../fire-event'
import type { UserEvent } from '../../../user-event'
import { setupUser } from '../../../user-event'
import ReviewEditor from '../../../../src/components/internal/review/ReviewEditor'
import type { UseDebounce } from '../../../../src/components/types/types'
import type {
  Location,
  SearchLocationIf,
} from '../../../../src/components/types/location/types'
import type {
  CreateBeerIf,
  SearchBeerIf,
} from '../../../../src/components/types/beer/types'
import type { ReviewContainerIf } from '../../../../src/components/types/review/types'
import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import { dontCall } from '../../../dont-call'
import {
  buildJoinedReview,
  buildReviewRequest,
} from '../../types/review/builders'
import type { ReviewRequest } from '../../../../src/components/types/review/types'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const dontCreate = {
  create: dontCall,
  isLoading: false,
}

const searchBeerId = '307334fc-bd6b-4782-9f5e-0cffb74d6d02'
const searchBeerName = 'Severin'
const beerSearchResult = {
  id: searchBeerId,
  name: searchBeerName,
  breweries: [
    {
      id: 'a990bf1b-266d-49fe-a4fd-a8fb1a1a93ee',
      name: 'Koskipanimo',
    },
  ],
  styles: [
    {
      id: '875f7295-5583-490e-98c6-66deb3432c97',
      name: 'american ipa',
    },
  ],
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
    search: async () => [beerSearchResult],
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
        searchFieldIf,
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
        searchFieldIf,
      },
    },
  },
}

const newReviewContainerId = '2859186e-156f-41fe-b979-829eaed31276'
const containerListResult = {
  id: newReviewContainerId,
  type: 'draft',
  size: '0.25',
}

const dateStr = '2022-04-01T12:00:00.000Z'
const currentDate = new Date(dateStr)

const reviewContainerIf: ReviewContainerIf = {
  createIf: {
    useCreate: () => dontCreate,
  },
  listIf: {
    useList: () => ({
      data: {
        containers: [containerListResult],
      },
      isLoading: false,
    }),
  },
}

const selectBeerIf = {
  create: dontCreateBeerIf,
  search: beerSearchIf,
}

const location: Location = {
  id: '9d7673a8-131e-4c96-b7b0-0a5ee9a72d2a',
  name: 'Panimomestari Oluthuone, Tampere, Finland',
}

const searchLocationIf: SearchLocationIf = {
  useSearch: () => ({
    search: async () => [location],
    isLoading: false,
  }),
  create: {
    useCreate: () => ({
      create: async () => location,
      isLoading: false,
    }),
  },
  searchFieldIf,
}

const additionalInfoText = 'Very nice atmosphere here'
const smellText = 'Very nice, caramel, hops'
const tasteText = 'Very good, caramel, malt, bitter'

const reviewRating = 10

// The review as it is shown and as it was loaded. The editor takes the beer,
// the container and the location from the first, and everything else from
// the second.
const joinedReview = buildJoinedReview({ location: undefined })
// The editor works in whole minutes, so a time without seconds is given back
// as it was loaded.
const review = buildReviewRequest({ time: dateStr })

async function addReview(
  getByPlaceholderText: (text: string) => HTMLElement,
  getByRole: RenderResult['getByRole'],
  user: UserEvent,
): Promise<void> {
  const additionalInfoInput = getByPlaceholderText('Additional info')
  additionalInfoInput.focus()
  await user.clear(additionalInfoInput)
  await user.paste(additionalInfoText)
  const locationInput = getByPlaceholderText('Location')
  locationInput.focus()
  await user.paste(location.name)
  const locationOption = getByRole('option', { name: location.name })
  await user.click(locationOption)
  const smellInput = getByPlaceholderText('Smell')
  smellInput.focus()
  await user.clear(smellInput)
  await user.paste(smellText)
  const ratingInput = getByRole('slider')
  ratingInput.click()
  fireEvent.change(ratingInput, { target: { value: `${reviewRating}` } })
  const tasteInput = getByPlaceholderText('Taste')
  tasteInput.focus()
  await user.clear(tasteInput)
  await user.paste(tasteText)
}

async function selectBeer(
  findByRole: (text: string, props: { name: string }) => Promise<HTMLElement>,
  getAllByRole: (text: string, props: { name: string }) => HTMLElement[],
  getByRole: (text: string, props: { name: string }) => HTMLElement,
  getByPlaceholderText: (text: string) => HTMLElement,
  user: UserEvent,
): Promise<void> {
  const selects = getAllByRole('radio', { name: 'Select' })
  await user.click(selects[0])
  const beerSearch = getByPlaceholderText('Search beer')
  assertDefined(beerSearch)
  beerSearch.focus()
  await user.paste('Seve')
  const beerOption = await findByRole('option', {
    name: 'Severin (Koskipanimo)',
  })
  await user.click(beerOption)
  getByRole('button', { name: 'Change' })
}

async function selectContainer(
  getByRole: (text: string, props?: { name: string }) => HTMLElement,
  user: UserEvent,
): Promise<void> {
  const containerSelect = getByRole('combobox', { name: 'Container' })
  await user.click(containerSelect)
  const draft = getByRole('option', { name: 'draft 0.25' })
  await user.selectOptions(containerSelect, draft)
  await user.click(draft)
}

test('adds review', async () => {
  const user = setupUser()
  const onChange = mockFunction<[review: ReviewRequest | undefined]>()
  const { findByRole, getAllByRole, getByPlaceholderText, getByRole } = render(
    <ReviewEditor
      currentDate={currentDate}
      initialReview={undefined}
      isFromStorage={false}
      onChange={onChange}
      reviewContainerIf={reviewContainerIf}
      searchLocationIf={searchLocationIf}
      selectBeerIf={selectBeerIf}
    />,
  )

  await selectBeer(
    findByRole,
    getAllByRole,
    getByRole,
    getByPlaceholderText,
    user,
  )
  await selectContainer(getByRole, user)
  await addReview(getByPlaceholderText, getByRole, user)
  const filteredChanged = onChange.mock.calls.filter(
    (params) => params[0] !== undefined,
  )
  assertDeepEqual(filteredChanged, [
    [
      {
        additionalInfo: additionalInfoText,
        beer: searchBeerId,
        container: newReviewContainerId,
        location: location.id,
        rating: reviewRating,
        smell: smellText,
        taste: tasteText,
        time: dateStr,
      },
    ],
  ])
})

test('adds review with custom time', async () => {
  const user = setupUser()
  const onChange = mockFunction<[review: ReviewRequest | undefined]>()
  const {
    findByRole,
    getAllByRole,
    getByLabelText,
    getByPlaceholderText,
    getByRole,
  } = render(
    <ReviewEditor
      currentDate={currentDate}
      initialReview={undefined}
      isFromStorage={false}
      onChange={onChange}
      reviewContainerIf={reviewContainerIf}
      searchLocationIf={searchLocationIf}
      selectBeerIf={selectBeerIf}
    />,
  )

  await selectBeer(
    findByRole,
    getAllByRole,
    getByRole,
    getByPlaceholderText,
    user,
  )
  await selectContainer(getByRole, user)

  const customDateTime = '2023-10-31T12:00'
  // Note that the customDateTime variable is specific to system timezone and
  // the full date time string will reflect that.
  const customDateTimeFull = new Date(customDateTime).toISOString()

  const dateInput = getByLabelText('Time input')
  fireEvent.change(dateInput, { target: { value: `${customDateTime}` } })

  await addReview(getByPlaceholderText, getByRole, user)
  const filteredChanged = onChange.mock.calls.filter(
    (params) => params[0] !== undefined,
  )

  assertDeepEqual(filteredChanged, [
    [
      {
        additionalInfo: additionalInfoText,
        beer: searchBeerId,
        container: newReviewContainerId,
        location: location.id,
        rating: reviewRating,
        smell: smellText,
        taste: tasteText,
        time: customDateTimeFull,
      },
    ],
  ])
})

test('change beer', async () => {
  const user = setupUser()
  const onChange = mockFunction<[review: ReviewRequest | undefined]>()
  const { findByRole, getAllByRole, getByPlaceholderText, getByRole } = render(
    <ReviewEditor
      currentDate={currentDate}
      initialReview={undefined}
      isFromStorage={false}
      onChange={onChange}
      reviewContainerIf={reviewContainerIf}
      searchLocationIf={searchLocationIf}
      selectBeerIf={selectBeerIf}
    />,
  )

  await selectBeer(
    findByRole,
    getAllByRole,
    getByRole,
    getByPlaceholderText,
    user,
  )
  const changeButton = getByRole('button', { name: 'Change' })
  await user.click(changeButton)
  getByPlaceholderText('Name')
})

test('change container', async () => {
  const user = setupUser()
  const onChange = mockFunction<[review: ReviewRequest | undefined]>()
  const { getByRole } = render(
    <ReviewEditor
      currentDate={currentDate}
      initialReview={undefined}
      isFromStorage={false}
      onChange={onChange}
      reviewContainerIf={reviewContainerIf}
      searchLocationIf={searchLocationIf}
      selectBeerIf={selectBeerIf}
    />,
  )

  await selectContainer(getByRole, user)
  const changeButton = getByRole('button', { name: 'Change' })
  await user.click(changeButton)
  getByRole('combobox', { name: 'Container' })
})

test('updates review', async () => {
  const user = setupUser()
  const onChange = mockFunction<[review: ReviewRequest | undefined]>()
  const { getAllByRole, getByPlaceholderText, getByRole } = render(
    <ReviewEditor
      currentDate={currentDate}
      initialReview={{
        joined: joinedReview,
        review,
      }}
      isFromStorage={false}
      onChange={onChange}
      reviewContainerIf={reviewContainerIf}
      searchLocationIf={searchLocationIf}
      selectBeerIf={selectBeerIf}
    />,
  )
  const changeButtons = getAllByRole('button', { name: 'Change' })
  assertEqual(changeButtons.length, 2)
  await addReview(getByPlaceholderText, getByRole, user)
  const finalChange = onChange.mock.calls[onChange.mock.calls.length - 1]
  assertDeepEqual(finalChange, [
    {
      additionalInfo: additionalInfoText,
      beer: joinedReview.beerId,
      container: joinedReview.container.id,
      location: location.id,
      rating: reviewRating,
      smell: smellText,
      taste: tasteText,
      time: dateStr,
    },
  ])
})

test('clears location', async () => {
  const user = setupUser()
  const onChange = mockFunction<[review: ReviewRequest | undefined]>()
  const location: Location = {
    id: '3134b9d0-8c2a-4021-b867-5bb992b3f184',
    name: 'Beer Hunters',
  }
  const { getByRole } = render(
    <ReviewEditor
      currentDate={currentDate}
      initialReview={{
        joined: {
          ...joinedReview,
          location,
        },
        review: {
          ...review,
          location: location.id,
        },
      }}
      isFromStorage={false}
      onChange={onChange}
      reviewContainerIf={reviewContainerIf}
      searchLocationIf={searchLocationIf}
      selectBeerIf={selectBeerIf}
    />,
  )
  const removeButton = getByRole('button', { name: 'Remove' })
  await user.click(removeButton)
  const finalChange = onChange.mock.calls[onChange.mock.calls.length - 1]
  assertDeepEqual(finalChange, [
    {
      additionalInfo: review.additionalInfo,
      beer: joinedReview.beerId,
      container: joinedReview.container.id,
      location: '',
      rating: review.rating,
      smell: review.smell,
      taste: review.taste,
      time: review.time,
    },
  ])
})

test('cannot change beer or container when from storage', () => {
  const { queryAllByRole } = render(
    <ReviewEditor
      currentDate={currentDate}
      initialReview={{
        joined: joinedReview,
        review,
      }}
      isFromStorage={true}
      onChange={() => undefined}
      reviewContainerIf={reviewContainerIf}
      searchLocationIf={searchLocationIf}
      selectBeerIf={selectBeerIf}
    />,
  )
  const changeButtons = queryAllByRole('button', { name: 'Change' })
  assertEqual(changeButtons.length, 0)
})
