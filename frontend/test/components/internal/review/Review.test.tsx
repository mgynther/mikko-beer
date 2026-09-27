import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import type { RenderResult } from '../../../render'
import { fireEvent } from '../../../fire-event'
import type { UserEvent } from '../../../user-event'
import { setupUser } from '../../../user-event'
import Review from '../../../../src/components/internal/review/Review'
import type { UseDebounce } from '../../../../src/components/types/types'
import { Role } from '../../../../src/components/types/user/types'
import { asText } from '../../../../src/components/internal/container/ContainerInfo'
import type { SearchLocationIf } from '../../../../src/components/types/location/types'
import type {
  CreateBeerIf,
  SearchBeerIf,
} from '../../../../src/components/types/beer/types'
import type {
  Review as ReviewType,
  ReviewContainerIf,
} from '../../../../src/components/types/review/types'
import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import { dontCall } from '../../../dont-call'
import { testLink } from '../../link'
import { buildContainer } from '../../types/container/builders'
import { buildLogin } from '../../types/login/builders'
import { buildJoinedReview, buildReview } from '../../types/review/builders'
import { buildUser } from '../../types/user/builders'

const useDebounce: UseDebounce<string> = (str) => [str, false]

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

const newReviewContainerId = '90c1bbac-3b19-42f9-9e49-e0ab4f7f9bb8'
const containerListResult = {
  id: newReviewContainerId,
  type: 'draft',
  size: '0.25',
}

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

const smellText = 'Very nice, caramel, hops'
const tasteText = 'Very good, caramel, malt, bitter'

const reviewRating = 10

const location = {
  id: '548cfb0b-8212-450f-a5d5-e3dbeb3dc5fb',
  name: 'Panimoravintola Plevna',
}
const joinedReview = buildJoinedReview({
  beerName: 'Siperia',
  location,
  styles: [
    { id: '30aad2a4-1f46-4f99-be9e-5b4d8bfa9bda', name: 'imperial stout' },
  ],
})
// The editor works in whole minutes, so a time without seconds is saved as it
// was loaded.
const review = buildReview({ time: '2022-04-01T12:00:00.000Z' })

const adminLogin = buildLogin({ user: buildUser({ role: Role.admin }) })
const viewerLogin = buildLogin({ user: buildUser({ role: Role.viewer }) })

async function addReview(
  getByPlaceholderText: (text: string) => HTMLElement,
  getByRole: RenderResult['getByRole'],
  user: UserEvent,
): Promise<void> {
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

test('updates review', async () => {
  const user = setupUser()
  const onChanged = mockFunction()
  const update = mockFunction()
  const { getByPlaceholderText, getByRole, getByText } = render(
    <Review
      linkComponent={testLink}
      review={joinedReview}
      onChanged={onChanged}
      reviewIf={{
        get: {
          useGet: () => ({
            get: async (): Promise<ReviewType> => review,
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
    />,
  )
  const beerName = getByText(joinedReview.beerName)
  await user.click(beerName)
  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  await addReview(getByPlaceholderText, getByRole, user)
  const saveButton = getByRole('button', { name: 'Save' })
  await user.click(saveButton)
  // The beer, the container and the location are those of the review as it is
  // shown, everything else is the review as it was loaded, and only what was
  // edited changes.
  assertDeepEqual(update.mock.calls, [
    [
      {
        id: joinedReview.id,
        additionalInfo: review.additionalInfo,
        beer: joinedReview.beerId,
        container: joinedReview.container.id,
        location: location.id,
        rating: reviewRating,
        smell: smellText,
        taste: tasteText,
        time: review.time,
      },
    ],
  ])
  assertDeepEqual(onChanged.mock.calls, [[]])
})

test('update review without onChanged callback', async () => {
  const user = setupUser()
  const update = mockFunction()
  const { getByPlaceholderText, getByRole, getByText } = render(
    <Review
      linkComponent={testLink}
      review={joinedReview}
      onChanged={undefined}
      reviewIf={{
        get: {
          useGet: () => ({
            get: async (): Promise<ReviewType> => review,
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
    />,
  )
  const beerName = getByText(joinedReview.beerName)
  await user.click(beerName)
  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  await addReview(getByPlaceholderText, getByRole, user)
  const saveButton = getByRole('button', { name: 'Save' })
  await user.click(saveButton)
  // The beer, the container and the location are those of the review as it is
  // shown, everything else is the review as it was loaded, and only what was
  // edited changes.
  assertDeepEqual(update.mock.calls, [
    [
      {
        id: joinedReview.id,
        additionalInfo: review.additionalInfo,
        beer: joinedReview.beerId,
        container: joinedReview.container.id,
        location: location.id,
        rating: reviewRating,
        smell: smellText,
        taste: tasteText,
        time: review.time,
      },
    ],
  ])
})

test('cancel editing', async () => {
  const user = setupUser()
  const onChanged = mockFunction()
  const update = mockFunction()
  const { getByRole, getByText } = render(
    <Review
      linkComponent={testLink}
      review={joinedReview}
      onChanged={onChanged}
      reviewIf={{
        get: {
          useGet: () => ({
            get: async (): Promise<ReviewType> => review,
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
    />,
  )
  const beerName = getByText(joinedReview.beerName)
  await user.click(beerName)
  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  const cancelButton = getByRole('button', { name: 'Cancel' })
  await user.click(cancelButton)
  getByText('imperial stout')
})

test('cannot update review as viewer', async () => {
  const user = setupUser()
  const onChanged = mockFunction()
  const update = mockFunction()
  const { getByText, queryByRole } = render(
    <Review
      linkComponent={testLink}
      review={joinedReview}
      onChanged={onChanged}
      reviewIf={{
        get: {
          useGet: () => ({
            get: async (): Promise<ReviewType> => review,
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
        getLogin: () => viewerLogin,
      }}
    />,
  )
  const beerName = getByText(joinedReview.beerName)
  await user.click(beerName)
  const editButton = queryByRole('button', { name: 'Edit' })
  assertDeepEqual(editButton, null)
})

test('renders review', async () => {
  const user = setupUser()
  const container = buildContainer({ type: 'bottle', size: '0.50' })
  const shownReview = buildJoinedReview({
    additionalInfo: 'Additional info',
    beerName: 'Siperia',
    breweries: [
      { id: 'dd236932-aba3-488e-a685-e99a8e7c8972', name: 'Koskipanimo' },
    ],
    container,
    location: { id: '7170c079-724d-4099-963b-85cd868dfa49', name: 'Oluthuone' },
    rating: 9,
    styles: [
      { id: '30aad2a4-1f46-4f99-be9e-5b4d8bfa9bda', name: 'imperial stout' },
    ],
    time: '2022-04-01T12:00:00.000Z',
  })
  const loadedReview = buildReview({
    smell: 'Nice',
    taste: 'Roasted malt, bitter, strong',
  })
  const onChanged = mockFunction()
  const update = mockFunction()
  const { getByText, getByRole } = render(
    <Review
      linkComponent={testLink}
      review={shownReview}
      onChanged={onChanged}
      reviewIf={{
        get: {
          useGet: () => ({
            get: async (): Promise<ReviewType> => loadedReview,
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
        getLogin: () => viewerLogin,
      }}
    />,
  )
  await user.click(getByText('Siperia'))
  getByRole('link', { name: 'Koskipanimo' })
  getByRole('link', { name: 'Siperia' })
  getByRole('link', { name: 'imperial stout' })
  getByText(9)
  getByText('2022-04-01')
  getByText(asText(container))
  getByText('Additional info')
  getByText('Oluthuone')
  getByText('Nice')
  getByText('Roasted malt, bitter, strong')
})
