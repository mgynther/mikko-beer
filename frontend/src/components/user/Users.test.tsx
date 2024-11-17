import { render } from '@testing-library/react'
import { test } from 'vitest'
import Users from './Users'
import { Role } from '../../core/user/types'

const dontCall = (): any => {
  throw new Error('must not be called')
}

test('renders user', () => {
  const { getByText } = render(
    <Users
      userIf={{
        create: {
          useCreate: () => ({
            create: dontCall,
            user: undefined,
            hasError: false,
            isLoading: false
          })
        },
        delete: {
          useDelete: () => ({
            delete: dontCall
          })
        },
        list: {
          useList: () => ({
            data: {
              users: [
                {
                  id: '117f9597-5b2a-4d40-ba3d-e996c7a1fb18',
                  username: 'User 1',
                  role: Role.viewer
                }
              ],
            },
            isLoading: false
          })
        }
      }}
    />
  )
  getByText('User 1 (viewer)')
})
