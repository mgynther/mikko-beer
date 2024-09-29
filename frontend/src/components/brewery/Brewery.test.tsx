import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Brewery from './Brewery'
import { Role } from '../../core/user/types'
import { UseDebounce } from '../../core/types'
import { StatsIf } from '../../core/stats/types'

const useDebounce: UseDebounce = (str: string) => str

const id = 'f57c65dd-80b1-46db-a41c-21ad137cb2a8'
const name = 'Hopping Brewsters'
const newNamePlaceholder = 'New name'

const dontCall = () => {
  throw new Error('must not be called')
}

function getLogin() {
  return () => ({
    user: {
      id: 'ada1b9b1-ea66-4e17-bda8-f8ea1e65a020',
      username: 'admin',
      role: Role.admin
    },
    authToken: 'auth',
    refreshToken: 'refresh'
  })
}

const dontSelectBeer = {
  create: {
    useCreate: dontCall,
    editBeerIf: {
      selectBreweryIf: {
        create: {
          useCreate: dontCall
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
}

const noOpContainerIf = {
  createIf: {
    useCreate: dontCall
  },
  listIf: {
    useList: dontCall
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
    })
  },
  overall: noStats,
  rating: noStats,
  style: noStats
}

test('updates brewery', async () => {
  const user = userEvent.setup()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <Brewery
      listReviewsByBreweryIf={{
        useList: () => ({
          reviews: { reviews: [] },
          isLoading: false
        })
      }}
      listStoragesByBreweryIf={{
        useList: () => ({
          storages: { storages: [] },
          isLoading: false
        })
      }}
      paramsIf={{
        useParams: () => ({ breweryId: id })
      }}
      reviewIf={{
        get: {
          useGet: () => ({
            get: async () => undefined
          })
        },
        update: {
          useUpdate: () => ({
            update: async () => {
              throw new Error('Function not implemented.')
            },
            isLoading: false
          }),
          selectBeerIf: dontSelectBeer,
          reviewContainerIf: noOpContainerIf
        },
        login: getLogin()
      }}
      getBreweryIf={{
        useGet: () => ({
          brewery: {
            id,
            name
          },
          isLoading: false
        })
      }}
      updateBreweryIf={{
        useUpdate: () => ({
          update,
          isLoading: false
        })
      }}
      searchIf={{
        useSearch: () => ({
          activate: () => { },
          isActive: true
        }),
        useDebounce
      }}
      statsIf={statsIf}
    />
  )
  getByRole('heading', { name })

  const editButton = getByRole('button', { name: 'Edit' })
  await act(async() => editButton.click())

  const saveButton = getByRole('button', { name: 'Save' })
  const nameInput = getByPlaceholderText(newNamePlaceholder)
  user.clear(nameInput)
  const newName = 'Hopping Brewsters R.I.P.'
  await act(async () => await user.type(nameInput, newName))
  expect(saveButton.hasAttribute('disabled')).toEqual(false)
  await act(async() => saveButton.click())
  const updateCalls = update.mock.calls
  expect(updateCalls).toEqual([[{
    id,
    name: newName
  }]])
})
