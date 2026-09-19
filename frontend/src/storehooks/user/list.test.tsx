import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import listUsers from './list'
import type {
  UseListUsers,
  UserList,
  ValidateUserListOrUndefined,
} from './types'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedUserList: UserList = {
  users: [
    {
      id: 'b4c5d6e7-f8a9-40b1-82c3-d4e5f6a7b8c9',
      username: 'validateduser',
      role: 'admin',
    },
  ],
}

const listed = { users: [{ id: 'listed', username: 'listed', role: 'admin' }] }

interface HelperProps {
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreList: UseListUsers = () => ({
    data: listed,
    isLoading: false,
  })
  const validate: ValidateUserListOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return validatedUserList
  }
  const { data, isLoading } = listUsers(useStoreList, validate).useList()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      {data?.users.map((user) => (
        <div key={user.id}>{user.username}</div>
      ))}
    </div>
  )
}

test('list users', () => {
  const onValidate = vitest.fn()

  const { getByText } = render(<Helper onValidate={onValidate} />)

  expect(getByText(validatedUserList.users[0].username)).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onValidate).toHaveBeenCalledWith(listed)
})
