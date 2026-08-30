import { expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import deleteUser from './delete'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

import Button from '../../components/common/Button'

interface HelperProps {
  userId: string
  handleResponse: () => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const deleteIf = deleteUser()
  const del = deleteIf.useDelete()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      await del.delete(props.userId)
      props.handleResponse()
    }
    void doHandle()
  }
  return <Button onClick={handleClick} text='Test' />
}

test('delete user', async () => {
  const user = userEvent.setup()

  const userId = '50a1b304-46fc-43de-b824-fce6de36ff6a'

  addTestServerResponse<void>({
    method: 'DELETE',
    pathname: `/api/v1/user/${userId}`,
    response: undefined,
    status: 200,
  })

  const handler = vitest.fn()
  const { getByRole } = render(
    <Provider store={store}>
      <Helper userId={userId} handleResponse={handler} />
    </Provider>,
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(handler).toHaveBeenCalled()
  })
})
