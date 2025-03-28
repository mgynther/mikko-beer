import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Beer from './Beer'
import { Role } from '../../core/user/types'
import LinkWrapper from '../LinkWrapper'
import type {
  JoinedReview,
  ListReviewsByIf,
  Review
} from '../../core/review/types'
import type { ListStoragesByIf, Storage } from '../../core/storage/types'
import type { UseDebounce } from '../../core/types'
import { asText } from '../container/ContainerInfo'
import type { SearchLocationIf } from '../../core/location/types'

const useDebounce: UseDebounce = str => str

const dontCall = (): any => {
  throw new Error('must not be called')
}

const brewery = {
  id: 'a5a8968d-4556-4f66-8351-21f724cc8316',
  name: 'Koskipanimo'
}

const style = {
  id: '0344f996-1475-45b6-aa84-ac7e0da47c7c',
  name: 'IPA',
  parents: []
}

const beer = {
  id: '60b1745f-0d7e-48c2-a993-90f127dd81ff',
  name: 'Smörre',
  breweries: [brewery],
  styles: [style]
}

const joinedReview: JoinedReview = {
  id: '9a3f616c-b6f3-4053-9986-64312b9547fe',
  additionalInfo: 'From batch #123',
  beerId: beer.id,
  beerName: beer.name,
  breweries: [],
  container: {
    id: '27a356d5-128a-4eab-83eb-00f8043288a3',
    type: 'bottle',
    size: '0.33'
  },
  location: undefined,
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

const storage: Storage = {
  id: 'd8022f91-5ec0-4836-a5cf-6fd4e7ca1b14',
  beerId: beer.id,
  beerName: beer.name,
  bestBefore: '2025-01-30',
  breweries: joinedReview.breweries,
  container: joinedReview.container,
  createdAt: '2019-09-29T09:00:00.000Z',
  hasReview: false,
  styles: joinedReview.styles
}

const login = {
  user: {
    id: '5046343b-5a39-40db-83fa-6833e7216d42',
    username: 'mikko',
    role: Role.admin
  },
  authToken: '',
  refreshToken: ''
}

const dontCreate = {
  create: dontCall,
  isLoading: false
}

const searchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true
  }),
  useDebounce
}

const searchLocationIf: SearchLocationIf = {
  useSearch: () => ({
    search: dontCall,
    isLoading: false
  }),
  create: {
    useCreate: () => ({
      create: dontCall,
      isLoading: false
    })
  }
}

const updateReview = {
  useUpdate: dontCall,
  searchLocationIf,
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
            useList: dontCall
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

const getBeerIf = {
  useGetBeer: () => ({
    beer,
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
    beerId: beer.id
  }),
  useSearch: () => ({
    get: () => undefined
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

function getListStoragesByBeerIf(storages: Storage[]): ListStoragesByIf {
  return {
    useList: () => ({
      storages: {
        storages
      },
      isLoading: false
    }),
    delete: {
      useDelete: () => ({
        delete: dontCall
      })
    }
  }
}

const editBeerIf = {
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
        styles: [],
        isLoading: false
      })
    }
  }
}

test('renders beer', async () => {
  const { getByRole, getByText } = render(
    <LinkWrapper>
      <Beer
        updateBeerIf={{
          useUpdate: () => ({
            update: dontCall,
            isLoading: false
          }),
          editBeerIf
        }}
        searchIf={searchIf}
        listReviewsByBeerIf={getListReviewsIf([joinedReview])}
        listStoragesByBeerIf={getListStoragesByBeerIf([storage])}
        paramsIf={paramsIf}
        reviewIf={reviewIf}
        getBeerIf={getBeerIf}
      />
    </LinkWrapper>
  )

  getByRole('heading', { name: beer.name })
  getByRole('link', { name: brewery.name })
  getByRole('link', { name: style.name })
  getByText(joinedReview.additionalInfo)
  getByText(asText(joinedReview.container))
  getByText(storage.bestBefore)
})

test('updates beer', async () => {
  const user = userEvent.setup()
  const update = vitest.fn()
  const { getByRole, getByPlaceholderText } = render(
    <LinkWrapper>
      <Beer
        updateBeerIf={{
          useUpdate: () => ({
            update,
            isLoading: false
          }),
          editBeerIf
        }}
        searchIf={searchIf}
        listReviewsByBeerIf={getListReviewsIf([])}
        listStoragesByBeerIf={getListStoragesByBeerIf([])}
        paramsIf={paramsIf}
        reviewIf={reviewIf}
        getBeerIf={getBeerIf}
      />
    </LinkWrapper>
  )

  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)
  const nameInput = getByPlaceholderText('Name')
  await user.clear(nameInput)
  const beerName = 'Sumutar'
  await user.type(nameInput, beerName)
  const saveButton = getByRole('button', { name: 'Save' })
  await user.click(saveButton)
  expect(update.mock.calls).toEqual([[{
    ...beer,
    name: beerName,
    breweries: [brewery.id],
    styles: [style.id],
  }]])
})
