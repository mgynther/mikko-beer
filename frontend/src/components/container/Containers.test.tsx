import { render } from '@testing-library/react'
import { test } from 'vitest'
import Containers from './Containers'
import { Role } from '../../core/user/types'

function getLogin() {
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

const updateContainerIf = {
  useUpdate: () => ({
    update: async () => undefined,
      isLoading: false
  })
}

test('renders containers', async () => {
  const { getByText } = render(
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
  getByText('can 0.50')
})
