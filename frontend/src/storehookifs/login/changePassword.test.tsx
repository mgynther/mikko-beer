import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import changePassword from './changePassword'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import userEvent from '@testing-library/user-event'

import Button from '../../components/common/Button'
import { PasswordChangeResult } from '../../core/login/types'

interface Props {
  userId: string
}

function Helper({ userId }: Props): React.JSX.Element {
  const changePasswordIf = changePassword()
  const { changePassword: doChangePassword } =
    changePasswordIf.useChangePassword()
  const { getResult } = changePasswordIf.useGetPasswordChangeResult()
  const result = getResult()
  return (
    <div>
      <div>{result}</div>
      <Button
        onClick={() => {
          void doChangePassword({
            userId,
            body: {
              oldPassword: 'oldpassword',
              newPassword: 'newpassword'
            }
          })
        }}
        text='Change password'
      />
    </div>
  )
}

interface PasswordChangeTest {
  name: string
  status: number
  result: PasswordChangeResult
}

const passwordChangeTests: PasswordChangeTest[] = [
  {
    name: 'success',
    status: 200,
    result: PasswordChangeResult.SUCCESS
  },
  {
    name: 'fail',
    status: 400,
    result: PasswordChangeResult.ERROR
  }
]

passwordChangeTests.forEach(testCase => {
  test(`change password: ${testCase.name}`, async () => {
    const user = userEvent.setup()

    const userId = '00448764-b114-4c54-a409-05b23d14de14'

    addTestServerResponse<{ success: true }>({
      method: 'POST',
      pathname: `/api/v1/user/${userId}/change-password`,
      response: { success: true },
      status: testCase.status
    })

    const { getByRole, getByText } = render(
      <Provider store={store}>
        <Helper userId={userId} />
      </Provider>
    )
    const changePasswordButton =
      getByRole('button', { name: 'Change password' })
    await user.click(changePasswordButton)
    await waitFor(() => {
      expect(getByText(testCase.result)).toBeDefined()
    })
  })
})
