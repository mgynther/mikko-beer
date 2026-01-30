import { test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import updateContainer from './update'
import type { Container } from '../../core/container/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'
import Button from '../../components/common/Button'

interface HelperProps {
  container: Container
  handleResponse: (container: Container) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const updateIf = updateContainer()
  const update = updateIf.useUpdate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      await update.update(props.container)
    }
    void doHandle()
  }
  return (
    <>
      <Button onClick={handleClick} text='Test' />
      {update.isLoading && <div>Loading</div>}
      {!update.isLoading && <div>Not loading</div>}
    </>
  )
}

test('update container', async () => {
  const user = userEvent.setup()

  const expectedResponse = {
    container: {
      id: 'ed8cfcd6-549e-45e5-901e-db2f9925856c',
      type: 'bottle',
      size: '0.50'
    }
  }

  addTestServerResponse<{container: Container}>({
    method: 'PUT',
    pathname: `/api/v1/container/${expectedResponse.container.id}`,
    response: expectedResponse,
    status: 200
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper container={expectedResponse.container} handleResponse={
        () => undefined
      } />
    </Provider>
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    getByText('Loading')
  })
  await waitFor(() => {
    getByText('Not loading')
  })
})
