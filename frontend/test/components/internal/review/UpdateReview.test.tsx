import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import type { RenderResult } from '../../../render'
import { fireEvent } from '../../../fire-event'
import type { UserEvent } from '../../../user-event'
import { setupUser } from '../../../user-event'
import UpdateReview from '../../../../src/components/internal/review/UpdateReview'
import type { UseDebounce } from '../../../../src/components/types/types'
import type {
  CreateBeerIf,
  SearchBeerIf,
} from '../../../../src/components/types/beer/types'
import type { ReviewContainerIf } from '../../../../src/components/types/review/types'
import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import type { SearchLocationIf } from '../../../../src/components/types/location/types'
import { dontCall } from '../../../dont-call'
import {
  buildJoinedReview,
  buildReviewRequest,
} from '../../types/review/builders'
import type { Review } from '../../../../src/components/types/review/types'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const dontCreate = {
  create: dontCall,
  isLoading: false,
}

const searchBeerId = 'f49f41b6-4a8b-473d-ab31-d0a69eaf6fc2'
const searchBeerName = 'Severin'
const beerSearchResult = {
  id: searchBeerId,
  name: searchBeerName,
  breweries: [
    {
      id: 'cfceef11-215f-4277-928e-b3383d952f3f',
      name: 'Koskipanimo',
    },
  ],
  styles: [
    {
      id: 'dc27712a-a74b-4cd8-8ea2-14e0f81f50ff',
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

const newReviewContainerId = 'f69b6af4-c267-49af-ada0-07137f22b740'
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

// The review as it is shown and as it was loaded. The beer, the container
// and the location are taken from the first, and everything else from the
// second.
const joinedReview = buildJoinedReview({ location: undefined })
// The editor works in whole minutes, so a time without seconds is saved as it
// was loaded.
const review = buildReviewRequest({ time: '2022-04-01T12:00:00.000Z' })

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
  const onSaved = mockFunction<[]>()
  const update = mockFunction<[request: Review], Promise<void>>(
    async () => undefined,
  )
  const { getByPlaceholderText, getByRole } = render(
    <UpdateReview
      initialReview={{
        joined: joinedReview,
        review,
      }}
      onSaved={onSaved}
      updateReviewIf={{
        useUpdate: () => ({
          update,
          isLoading: false,
        }),
        searchLocationIf,
        selectBeerIf,
        reviewContainerIf,
      }}
      onCancel={dontCall}
    />,
  )
  await addReview(getByPlaceholderText, getByRole, user)
  const saveButton = getByRole('button', { name: 'Save' })
  await user.click(saveButton)
  assertDeepEqual(update.mock.calls, [
    [
      {
        id: joinedReview.id,
        additionalInfo: review.additionalInfo,
        beer: joinedReview.beerId,
        container: joinedReview.container.id,
        location: '',
        rating: reviewRating,
        smell: smellText,
        taste: tasteText,
        time: review.time,
      },
    ],
  ])
  assertDeepEqual(onSaved.mock.calls, [[]])
})

test('cancels update', async () => {
  const user = setupUser()
  const onCancel = mockFunction<[]>()
  const { getByPlaceholderText, getByRole } = render(
    <UpdateReview
      initialReview={{
        joined: joinedReview,
        review,
      }}
      onSaved={dontCall}
      updateReviewIf={{
        useUpdate: () => ({
          update: dontCall,
          isLoading: false,
        }),
        searchLocationIf,
        selectBeerIf,
        reviewContainerIf,
      }}
      onCancel={onCancel}
    />,
  )
  await addReview(getByPlaceholderText, getByRole, user)
  const cancelButton = getByRole('button', { name: 'Cancel' })
  await user.click(cancelButton)
  assertDeepEqual(onCancel.mock.calls, [[]])
})
