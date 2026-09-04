import { beforeAll, beforeEach, afterAll, expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { createServer } from '../../../test-util/server'
import type { TestServer } from '../../../test-util/server'
import deleteStorage from './delete'
import { render, waitFor } from '@testing-library/react'
import { setupUser } from '../../../test-util/user-event'
import { Provider } from '../../react-redux-wrapper'

import Button from '../../components/common/Button'

let server: TestServer | undefined

beforeAll(() => {
  server = createServer()
})

beforeEach(() => {
  server?.clear()
})

afterAll(() => {
  server?.close()
})

interface HelperProps {
  storageId: string
  handleResponse: () => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const deleteIf = deleteStorage()
  const del = deleteIf.useDelete()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      await del.delete(props.storageId)
      props.handleResponse()
    }
    void doHandle()
  }
  return <Button onClick={handleClick} text='Test' />
}

test('delete storage', async () => {
  const user = setupUser()

  const storageId = 'b52fc245-2b0c-468f-be25-8d7401564229'

  server?.addResponse<void>({
    method: 'DELETE',
    pathname: `/api/v1/storage/${storageId}`,
    response: undefined,
    status: 200,
  })

  const handler = vitest.fn()
  const { getByRole } = render(
    <Provider store={store}>
      <Helper storageId={storageId} handleResponse={handler} />
    </Provider>,
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(handler).toHaveBeenCalled()
  })
})
