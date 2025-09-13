import { expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import createContainer from './create'
import type { Container, ContainerRequest } from '../../core/container/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

import Button from '../../components/common/Button'

interface HelperProps {
  container: ContainerRequest
  handleResponse: (container: Container) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const createIf = createContainer()
  const create = createIf.useCreate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      const response = await create.create(props.container)
      props.handleResponse(response)
    }
    void doHandle()
  }
  return (
    <Button onClick={handleClick} text='Test' />
  )
}

test('create container', async () => {
  const user = userEvent.setup()

  const expectedResponse = {
    container: {
      id: 'e1ed6014-3653-4792-a7d5-711b40f4c70f',
      type: 'bottle',
      size: '0.33'
    }
  }

  addTestServerResponse<{container: Container}>({
    method: 'POST',
    pathname: '/api/v1/container',
    response: expectedResponse,
    status: 201
  })

  const handler = vitest.fn()
  const { getByRole } = render(
    <Provider store={store}>
      <Helper
        container={{
          type: expectedResponse.container.type,
          size: expectedResponse.container.size
        }}
        handleResponse={
          handler
        }
      />
    </Provider>
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(handler).toHaveBeenCalledWith(expectedResponse.container)
  })
})
