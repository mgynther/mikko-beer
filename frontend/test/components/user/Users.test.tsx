import { render } from '@testing-library/react'
import { test } from 'vitest'
import Users from '../../../src/components/user/Users'
import { Role } from '../../../src/components/types/user/types'
import { dontCall } from '../../dont-call'

test('renders user', () => {
  const { getByText } = render(
    <Users
      userIf={{
        create: {
          useCreate: () => ({
            create: dontCall,
            user: undefined,
            hasError: false,
            isLoading: false,
          }),
        },
        delete: {
          useDelete: () => ({
            delete: dontCall,
          }),
        },
        list: {
          useList: () => ({
            data: {
              users: [
                {
                  id: '117f9597-5b2a-4d40-ba3d-e996c7a1fb18',
                  username: 'User 1',
                  role: Role.viewer,
                },
              ],
            },
            isLoading: false,
          }),
        },
      }}
    />,
  )
  getByText('User 1 (viewer)')
})
