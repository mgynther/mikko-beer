import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import Containers from './Containers'
import { Role } from '../../core/user/types'
import type { GetLogin } from '../../core/login/types'
import type { UpdateContainerIf } from '../../core/container/types'
import { loadingIndicatorText } from '../common/LoadingIndicator'

function getLogin(): GetLogin {
  return () => ({
    user: {
      id: '05952a9e-1c6f-4974-9c1c-4e5fe473b0f7',
      username: 'viewer',
      role: Role.viewer
    },
    authToken: 'auth',
    refreshToken: 'refresh'
  })
}

const updateContainerIf: UpdateContainerIf = {
  useUpdate: () => ({
    update: async () => undefined,
      isLoading: false
  })
}

test('renders containers', async () => {
  const { getAllByText, getByText } = render(
    <Containers
      listContainersIf={{
        useList: () => ({
          data: {
            containers: [
              {
                id: 'e3fad94c-2408-4f8f-8e3f-2b2c30ae6bfb',
                type: 'bottle',
                size: '0.33'
              },
              {
                id: 'b56107e2-9e92-4cbd-a0f1-bae25e44caa2',
                type: 'can',
                size: '0.50'
              },
              {
                id: '8537da96-eb9d-4d9c-a348-fdc5ef72a05b',
                type: 'can',
                size: '0.33'
              }
            ]
          },
          isLoading: false
        })
      }}
      getLogin={getLogin()}
      updateContainerIf={updateContainerIf}
    />
  )
  getByText('bottle 0.33')
  getByText('can 0.33')
  getByText('can 0.50')
  const listItems = getAllByText(/bottle|can/)
  expect(listItems.map(item => item.innerHTML)).toEqual([
    'bottle 0.33',
    'can 0.33',
    'can 0.50'
  ])
})

test('renders loading', async () => {
  const { getByText } = render(
    <Containers
      listContainersIf={{
        useList: () => ({
          data: undefined,
          isLoading: true
        })
      }}
      getLogin={getLogin()}
      updateContainerIf={updateContainerIf}
    />
  )
  getByText(loadingIndicatorText)
})
