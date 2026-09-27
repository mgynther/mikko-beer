import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import changePassword from '../../../src/storehooks/login/changePassword'
import type {
  ChangePasswordParams,
  PasswordChangeResult,
  UseChangePassword,
  UsePasswordChangeResult,
} from '../../../src/storehooks/login/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'

// Stubs for the store functions, for the reason given in
// storehooks/brewery/get.test.tsx. Changing a password validates nothing:
// what is proven here is that the parameters reach the store and that the
// result the store keeps reaches the interface.
const params: ChangePasswordParams = {
  userId: '00448764-b114-4c54-a409-05b23d14de14',
  body: {
    oldPassword: 'oldpassword',
    newPassword: 'newpassword',
  },
}

interface HelperProps {
  result: PasswordChangeResult
  onChange: (params: ChangePasswordParams) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreChange: UseChangePassword = () => ({
    changePassword: async (
      changeParams: ChangePasswordParams,
    ): Promise<void> => {
      props.onChange(changeParams)
    },
    isLoading: false,
  })
  const useStoreResult: UsePasswordChangeResult = () => props.result
  const changePasswordIf = changePassword(useStoreChange, useStoreResult)
  const { changePassword: doChangePassword, isLoading } =
    changePasswordIf.useChangePassword()
  const { getResult } = changePasswordIf.useGetPasswordChangeResult()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{getResult()}</div>
      <button
        type='button'
        onClick={() => {
          doChangePassword(params).catch(
            createErrorLogger('doChangePassword failed', console.error),
          )
        }}
      >
        Change password
      </button>
    </div>
  )
}

test('change password', async () => {
  const user = setupUser()
  const onChange = mockFunction<[params: ChangePasswordParams]>()

  const { getByRole, getByText } = render(
    <Helper result='UNDEFINED' onChange={onChange} />,
  )

  await user.click(getByRole('button', { name: 'Change password' }))
  await waitFor(() => {
    assertCalledWith(onChange, [params])
  })
  assertDefined(getByText('Not loading'))
})

test('the password change result comes from the store', () => {
  const { getByText } = render(
    <Helper result='SUCCESS' onChange={() => undefined} />,
  )

  assertDefined(getByText('SUCCESS'))
})
