import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'

import listUsers from '../../../src/storehooks/user/list'
import type {
  UseListUsers,
  UserList,
  ValidateUserListOrUndefined,
} from '../../../src/storehooks/user/types'
import { buildUser } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedUserList: UserList = {
  users: [buildUser({ username: 'validateduser' })],
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
  const onValidate = mockFunction()

  const { getByText } = render(<Helper onValidate={onValidate} />)

  assertDefined(getByText(validatedUserList.users[0].username))
  assertDefined(getByText('Not loading'))
  assertCalledWith(onValidate, [listed])
})
