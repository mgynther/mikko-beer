import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import ReviewsBy from './ReviewsBy'
import type { UseDebounce } from '../../core/types'
import type { Login } from '../../core/login/types'
import { Role } from '../../core/user/types'
import LinkWrapper from '../LinkWrapper'
import type {
  FilteredListReviewParams,
  ReviewContainerIf,
  ReviewIf,
} from '../../core/review/types'
import type {
  CreateBeerIf,
  SearchBeerIf,
  SelectBeerIf,
} from '../../core/beer/types'
import type { SearchIf } from '../../core/search/types'
import type { SearchLocationIf } from '../../core/location/types'
import { loadingIndicatorText } from '../common/LoadingIndicator'

const useDebounce: UseDebounce<string> = (str) => [str, false]

const dontCall = (): any => {
  throw new Error('must not be called')
}

const dontCreate = {
  create: dontCall,
  isLoading: false,
}

const beerSearchIf: SearchBeerIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false,
  }),
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

const searchIf: SearchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true,
  }),
  useDebounce,
}

const selectBeerIf: SelectBeerIf = {
  create: dontCreateBeerIf,
  search: beerSearchIf,
}

const joinedReview = {
  id: 'f1f2157a-3bad-4a40-9da8-2da8c3f6d69b',
  additionalInfo: '',
  beerId: '22e2ee56-4eb0-48db-969c-a0ac57396b5e',
  beerName: 'Ikiurso',
  breweries: [
    {
      id: 'f00effc4-ddca-4100-95f6-9f2f3456256b',
      name: 'Panimo Hiisi',
    },
  ],
  container: {
    id: '705c2235-e957-4b2a-8994-a0c026c09bd3',
    type: 'bottle',
    size: '0.33',
  },
  location: undefined,
  rating: 9,
  styles: [
    {
      id: '65550e97-9d64-4692-804b-5b82131a71ff',
      name: 'imperial stout',
    },
  ],
  time: '2023-08-15T12:00:00.000Z',
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
}

const dontUpdateReviewIf: ReviewIf = {
  get: {
    useGet: () => ({
      get: dontCall,
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
  login: () => adminLogin,
}

const adminLogin: Login = {
  user: {
    id: '4b07d278-b705-4ea2-bc43-20ab95a5fba3',
    username: 'admin',
    role: Role.admin,
  },
  authToken: '',
  refreshToken: '',
}

test('lists reviews', async () => {
  const user = userEvent.setup()
  const list = vitest.fn()
  const id = '833c90e2-e2c6-42c9-a1ee-a4454b42a302'
  const { getByRole } = render(
    <LinkWrapper>
      <ReviewsBy
        id={id}
        listReviewsByIf={{
          useList: (params: FilteredListReviewParams) => {
            list(params)
            return {
              reviews: {
                reviews: [joinedReview],
                sorting: {
                  order: 'time',
                  direction: 'desc',
                },
              },
              isLoading: false,
            }
          },
        }}
        reviewIf={dontUpdateReviewIf}
        searchIf={searchIf}
      />
    </LinkWrapper>,
  )

  const ratingButton = getByRole('button', { name: 'Rating' })
  await user.click(ratingButton)
  expect(list.mock.calls).toEqual([
    [
      {
        id,
        sorting: {
          direction: 'asc',
          order: 'beer_name',
        },
      },
    ],
    [
      {
        id,
        sorting: {
          direction: 'desc',
          order: 'rating',
        },
      },
    ],
  ])
})

test('renders loading', async () => {
  const list = vitest.fn()
  const id = '919a59cf-1f8c-4d29-85c5-814655eaab80'
  const { getByText } = render(
    <LinkWrapper>
      <ReviewsBy
        id={id}
        listReviewsByIf={{
          useList: (params: FilteredListReviewParams) => {
            list(params)
            return {
              reviews: undefined,
              isLoading: true,
            }
          },
        }}
        reviewIf={dontUpdateReviewIf}
        searchIf={searchIf}
      />
    </LinkWrapper>,
  )
  getByText(loadingIndicatorText)
})
