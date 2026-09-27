import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import ReviewList from '../../../../src/components/internal/review/ReviewList'
import type { UseDebounce } from '../../../../src/components/types/types'
import { Role } from '../../../../src/components/types/user/types'
import type {
  Review,
  ReviewContainerIf,
  ReviewIf,
  ReviewSorting,
  ReviewSortingOrder,
} from '../../../../src/components/types/review/types'
import type { SearchLocationIf } from '../../../../src/components/types/location/types'
import type {
  CreateBeerIf,
  SearchBeerIf,
  SelectBeerIf,
} from '../../../../src/components/types/beer/types'
import type { SearchFieldIf } from '../../../../src/components/types/search/types'
import { dontCall } from '../../../dont-call'
import { testLink } from '../../link'
import { buildLogin } from '../../types/login/builders'
import { buildJoinedReview, buildReview } from '../../types/review/builders'
import { buildUser } from '../../types/user/builders'
import { buildReviewFilters } from './builders'

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

const newTasteText = 'Very good, caramel, malt, bitter'

const joinedReview = buildJoinedReview({
  id: 'a2b1bef8-717c-4323-979c-cf220745666c',
  beerName: 'Siperia',
  breweries: [
    { id: 'dd236932-aba3-488e-a685-e99a8e7c8972', name: 'Koskipanimo' },
  ],
  location: undefined,
  rating: 9,
  styles: [
    { id: '30aad2a4-1f46-4f99-be9e-5b4d8bfa9bda', name: 'imperial stout' },
  ],
})

// The editor works in whole minutes, so a time without seconds is saved as it
// was loaded.
const review = buildReview({
  smell: 'Nice',
  taste: 'Roasted malt, bitter, strong',
  time: '2022-04-01T12:00:00.000Z',
})

const anotherJoinedReview = buildJoinedReview({
  id: '40df563a-e3bb-46eb-b5c2-85a1b079ee74',
  beerName: 'CCCCC IPA',
  breweries: [
    { id: 'fddab316-81a6-4d49-abc1-3e96e2b37442', name: 'Beer Hunters' },
  ],
  styles: [
    { id: '9e67df6d-3bde-4b5b-ba02-b17a9a743b49', name: 'american ipa' },
  ],
})

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
  getLogin: () => adminLogin,
}

const adminLogin = buildLogin({ user: buildUser({ role: Role.admin }) })

const irrelevantSorting: ReviewSorting = {
  order: 'beer_name',
  direction: 'asc',
}

const irrelevantSupportedSorting: ReviewSortingOrder[] = ['beer_name']

const reviewFilters = buildReviewFilters()

test('updates review', async () => {
  const user = setupUser()
  const onChanged = mockFunction<[]>()
  const update = mockFunction<[request: Review], Promise<void>>(
    async () => undefined,
  )
  const { getByPlaceholderText, getByRole, getByText } = render(
    <ReviewList
      linkComponent={testLink}
      filterState={{
        isOpen: false,
        setIsOpen: dontCall,
        filters: reviewFilters,
      }}
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
        getLogin: () => adminLogin,
      }}
    />,
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
  assertDeepEqual(update.mock.calls, [
    [
      // The beer, the container and the location are those of the review as
      // it is shown, everything else is the review as it was loaded.
      {
        id: joinedReview.id,
        additionalInfo: review.additionalInfo,
        beer: joinedReview.beerId,
        container: joinedReview.container.id,
        location: '',
        rating: review.rating,
        smell: review.smell,
        taste: newTasteText,
        time: review.time,
      },
    ],
  ])
  assertDeepEqual(onChanged.mock.calls, [[]])
})

test('sets review sorting', async () => {
  const user = setupUser()
  const setSorting = mockFunction<[sorting: ReviewSortingOrder]>()
  const { getByRole } = render(
    <ReviewList
      linkComponent={testLink}
      filterState={{
        isOpen: false,
        setIsOpen: dontCall,
        filters: reviewFilters,
      }}
      isLoading={false}
      isTitleVisible={true}
      sorting={{
        order: 'beer_name',
        direction: 'desc',
      }}
      setSorting={setSorting}
      supportedSorting={['beer_name', 'brewery_name']}
      reviews={[joinedReview]}
      onChanged={dontCall}
      reviewIf={dontUpdateReviewIf}
    />,
  )
  getByRole('button', { name: 'Name ▼' })
  const breweriesButton = getByRole('button', { name: 'Breweries' })
  await user.click(breweriesButton)
  assertDeepEqual(setSorting.mock.calls, [['brewery_name']])
})

test('renders reviews', async () => {
  const user = setupUser()
  const { getByText, getByRole } = render(
    <ReviewList
      linkComponent={testLink}
      filterState={{
        isOpen: false,
        setIsOpen: dontCall,
        filters: reviewFilters,
      }}
      isLoading={false}
      isTitleVisible={true}
      sorting={irrelevantSorting}
      setSorting={() => undefined}
      supportedSorting={irrelevantSupportedSorting}
      reviews={[joinedReview, anotherJoinedReview]}
      onChanged={dontCall}
      reviewIf={dontUpdateReviewIf}
    />,
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
    <ReviewList
      linkComponent={testLink}
      filterState={{
        isOpen: false,
        setIsOpen: dontCall,
        filters: reviewFilters,
      }}
      isLoading={false}
      isTitleVisible={true}
      sorting={irrelevantSorting}
      setSorting={() => undefined}
      supportedSorting={irrelevantSupportedSorting}
      reviews={[joinedReview, anotherJoinedReview]}
      onChanged={dontCall}
      reviewIf={dontUpdateReviewIf}
    />,
  )
  getByRole('heading', { name: 'Reviews' })
})

test('does not render title', async () => {
  const { queryByRole } = render(
    <ReviewList
      linkComponent={testLink}
      filterState={{
        isOpen: false,
        setIsOpen: dontCall,
        filters: reviewFilters,
      }}
      isLoading={false}
      isTitleVisible={false}
      sorting={irrelevantSorting}
      setSorting={() => undefined}
      supportedSorting={irrelevantSupportedSorting}
      reviews={[joinedReview, anotherJoinedReview]}
      onChanged={dontCall}
      reviewIf={dontUpdateReviewIf}
    />,
  )
  const heading = queryByRole('heading', { name: 'Reviews' })
  assertDeepEqual(heading, null)
})
