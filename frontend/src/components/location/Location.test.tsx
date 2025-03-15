import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Location from './Location'
import { Role } from '../../core/user/types'
import type { UseDebounce } from '../../core/types'
import type { StatsIf } from '../../core/stats/types'

const useDebounce: UseDebounce = str => str

const dontCall = (): any => {
  throw new Error('must not be called')
}

const id = '88471fe8-0f00-4a37-9b1c-9db78933c0a6'
const name = 'Oluthuone Pamimomestari'
const newNamePlaceholder = 'New name'

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

const noStats = {
  useStats: () => ({
    stats: undefined,
    isLoading: false
  })
}

const noInfiniteScrollStats = {
  useStats: () => ({
    query: async () => undefined,
    stats: undefined,
    isLoading: false
  }),
  infiniteScroll: dontCall
}

const statsIf: StatsIf = {
  annual: noStats,
  brewery: noInfiniteScrollStats,
  container: noStats,
  location: noInfiniteScrollStats,
  overall: noStats,
  rating: noStats,
  style: noStats,
  setSearch: async () => undefined
}

test('updates location', async () => {
  const user = userEvent.setup()
  const update = vitest.fn()
  const { getByPlaceholderText, getByRole } = render(
    <Location
      paramsIf={{
        useParams: () => ({ locationId: id }),
        useSearch: () => ({
          get: () => undefined
        })
      }}
      getLocationIf={{
        useGet: () => ({
          location: {
            id,
            name
          },
          isLoading: false
        })
      }}
      updateLocationIf={{
        useUpdate: () => ({
          update,
          isLoading: false
        }),
        login: getLogin()
      }}
      statsIf={statsIf}
      searchIf={{
        useSearch: () => ({
          activate: () => undefined,
          isActive: true
        }),
        useDebounce
      }}
    />
  )
  getByRole('heading', { name })

  const editButton = getByRole('button', { name: 'Edit' })
  await user.click(editButton)

  const saveButton = getByRole('button', { name: 'Save' })
  const nameInput = getByPlaceholderText(newNamePlaceholder)
  await user.clear(nameInput)
  const newName = 'Oluthuone Panimomestari'
  await user.type(nameInput, newName)
  expect(saveButton.hasAttribute('disabled')).toEqual(false)
  await user.click(saveButton)
  const updateCalls = update.mock.calls
  expect(updateCalls).toEqual([[{
    id,
    name: newName
  }]])
})
