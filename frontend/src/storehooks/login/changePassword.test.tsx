import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import changePassword from './changePassword'
import type {
  ChangePasswordParams,
  PasswordChangeResult,
  UseChangePassword,
  UsePasswordChangeResult,
} from './types'
import { setupUser } from '../../../test-util/user-event'
import { createErrorLogger } from '../../../test-util/error-logger'

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
  const onChange = vitest.fn()

  const { getByRole, getByText } = render(
    <Helper result='UNDEFINED' onChange={onChange} />,
  )

  await user.click(getByRole('button', { name: 'Change password' }))
  await waitFor(() => {
    expect(onChange).toHaveBeenCalledWith(params)
  })
  expect(getByText('Not loading')).toBeDefined()
})

test('the password change result comes from the store', () => {
  const { getByText } = render(
    <Helper result='SUCCESS' onChange={() => undefined} />,
  )

  expect(getByText('SUCCESS')).toBeDefined()
})
