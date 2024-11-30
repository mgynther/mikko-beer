import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Style from './Style'
import { Role } from '../../core/user/types'
import LinkWrapper from '../LinkWrapper'
import type {
  JoinedReview,
  ListReviewsByIf,
  Review,
  UpdateReviewIf
} from '../../core/review/types'
import type { ListStoragesByIf, Storage } from '../../core/storage/types'
import type { StatsIf } from '../../core/stats/types'
import type { GetStyleIf } from '../../core/style/types'

const useDebounce = (str: string): string => str

const dontCall = (): any => {
  throw new Error('must not be called')
}

const brewery = {
  id: '6290fa39-3515-4682-a69c-51d18b2b03b1',
  name: 'Koskipanimo'
}

const parent = {
  id: '97dfdc08-67bb-4ba1-a29e-2f7dfdea4875',
  name: 'Pale Ale',
  parents: []
}

const child = {
  id: '7217469e-4e16-45a1-9873-83ba81b21a37',
  name: 'NEIPA',
  parents: []
}

const style = {
  id: 'd34ef4ef-87ac-4eeb-b08a-ad0d6d00f38d',
  name: 'IPA',
  parents: [parent],
  children: [child]
}

const beer = {
  id: '4eee87d3-a451-46bf-a8dc-16778bc108af',
  name: 'Smörre',
  breweries: [brewery],
  styles: [style]
}

const joinedReview: JoinedReview = {
  id: '6cf9fdd2-e922-4bc6-bac5-0f231193679e',
  additionalInfo: 'From batch #123',
  beerId: beer.id,
  beerName: beer.name,
  breweries: [],
  container: {
    id: '345a65ed-3bb2-4be3-a370-5610e5d0edd0',
    type: 'bottle',
    size: '0.33'
  },
  location: '',
  styles: [],
  time: '2024-10-12T15:23:45.000Z',
  rating: 10
}

const review: Review = {
  id: joinedReview.id,
  additionalInfo: joinedReview.additionalInfo,
  beer: beer.id,
  container: joinedReview.container.id,
  location: '',
  time: joinedReview.time,
  rating: 10,
  smell: '',
  taste: ''
}

const storage = {
  id: '350d015b-22d7-4bc7-b126-19ad09c5733c',
  beerId: beer.id,
  beerName: beer.name,
  bestBefore: '2025-01-30',
  breweries: joinedReview.breweries,
  container: joinedReview.container,
  styles: joinedReview.styles
}

const login = {
  user: {
    id: 'dc39260f-b459-4688-9103-08ef7ad903b0',
    username: 'mikko',
    role: Role.admin
  },
  authToken: '',
  refreshToken: ''
}

const searchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true
  }),
  useDebounce
}

const updateReview: UpdateReviewIf = {
  useUpdate: dontCall,
  selectBeerIf: {
    create: {
      useCreate: dontCall,
      editBeerIf: {
        selectBreweryIf: {
          create: {
            useCreate: () => ({
              create: dontCall,
              isLoading: false
            })
          },
          search: {
            useSearch: dontCall
          }
        },
        selectStyleIf: {
          create: {
            useCreate: dontCall
          },
          list: {
            useList: () => ({
              styles: [],
              isLoading: false
            })
          }
        }
      }
    },
    search: {
      useSearch: dontCall
    }
  },
  reviewContainerIf: {
    createIf: {
      useCreate: dontCall
    },
    listIf: {
      useList: dontCall
    }
  }
}

const getStyleIf: GetStyleIf = {
  useGet: () => ({
    style,
    isLoading: false
  })
}

const reviewIf = {
  get: {
    useGet: () => ({
      review,
      get: async () => review
    })
  },
  update: updateReview,
  login: () => login
}

const paramsIf = {
  useParams: () => ({
    styleId: style.id
  })
}

function getListReviewsIf(reviews: JoinedReview[]): ListReviewsByIf {
  return {
    useList: () => ({
      reviews: {
        reviews,
        sorting: undefined
      },
      isLoading: false
    })
  }
}

function getListStoragesByStyleIf(storages: Storage[]): ListStoragesByIf {
  return {
    useList: () => ({
      storages: {
        storages
      },
      isLoading: false
    })
  }
}

const noStats = {
  useStats: () => ({
    stats: undefined,
    isLoading: false
  })
}

const statsIf: StatsIf = {
  annual: noStats,
  brewery: {
    useStats: () => ({
      query: async () => undefined,
      stats: undefined,
      isLoading: false
    }),
    infiniteScroll: dontCall
  },
  overall: noStats,
  rating: noStats,
  style: noStats
}

test('renders style', async () => {
  const { getByRole, getByText } = render(
    <LinkWrapper>
      <Style
        updateStyleIf={{
          useUpdate: () => ({
            update: dontCall,
            hasError: false,
            isLoading: false,
            isSuccess: false
          }),
        }}
        searchIf={searchIf}
        listReviewsByStyleIf={getListReviewsIf([joinedReview])}
        listStoragesByStyleIf={getListStoragesByStyleIf([storage])}
        paramsIf={paramsIf}
        reviewIf={reviewIf}
        getStyleIf={getStyleIf}
        statsIf={statsIf}
      />
    </LinkWrapper>
  )

  getByRole('heading', { name: style.name })
  getByRole('link', { name: parent.name })
  getByRole('link', { name: child.name })
  getByText(joinedReview.additionalInfo)
  getByText(`${joinedReview.container.type} ${joinedReview.container.size}`)
  getByText(storage.bestBefore)
})

test('updates style', async () => {
  const user = userEvent.setup()
  const update = vitest.fn()
  const { getByRole, getByPlaceholderText } = render(
    <LinkWrapper>
      <Style
        updateStyleIf={{
          useUpdate: () => ({
            update,
            hasError: false,
            isLoading: false,
            isSuccess: false
          })
        }}
        searchIf={searchIf}
        listReviewsByStyleIf={getListReviewsIf([])}
        listStoragesByStyleIf={getListStoragesByStyleIf([])}
        paramsIf={paramsIf}
        reviewIf={reviewIf}
        getStyleIf={getStyleIf}
        statsIf={statsIf}
      />
    </LinkWrapper>
  )

  const editButton = getByRole('button', { name: 'Edit' })
  act(() => { editButton.click(); })
  const nameInput = getByPlaceholderText('Name')
  await user.clear(nameInput)
  const styleName = 'Rye IPA'
  await user.type(nameInput, styleName)
  const removeParentButton = getByRole('button', { name: 'Remove' })
  act(() => { removeParentButton.click(); })
  const saveButton = getByRole('button', { name: 'Save' })
  act(() => { saveButton.click(); })
  expect(update.mock.calls).toEqual([[{
    id: style.id,
    name: styleName,
    parents: []
  }]])
})
