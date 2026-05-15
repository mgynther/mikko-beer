import { expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import createStorage from './create'
import type {
  CreatedStorage,
  CreateStorageRequest,
} from '../../core/storage/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

import Button from '../../components/common/Button'

interface HelperProps {
  storage: CreateStorageRequest
  handleResponse: (storage: CreatedStorage) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const createIf = createStorage()
  const create = createIf.useCreate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      const response = await create.create(props.storage)
      props.handleResponse(response)
    }
    void doHandle()
  }
  return <Button onClick={handleClick} text='Test' />
}

test('create storage', async () => {
  const user = userEvent.setup()

  const expectedResponse: { storage: CreatedStorage } = {
    storage: {
      id: '16a507d9-e6c7-4405-8bb7-a4bb0cbe97a4',
      beer: '30111f34-eceb-44ea-9b21-6c5b50b91a79',
      bestBefore: '2027-01-01T00:00:00.000Z',
      container: '997aa7c3-199a-40a9-a962-d9d5371557e3',
    },
  }

  addTestServerResponse<{ storage: CreatedStorage }>({
    method: 'POST',
    pathname: '/api/v1/storage',
    response: expectedResponse,
    status: 201,
  })

  const handler = vitest.fn()
  const { getByRole } = render(
    <Provider store={store}>
      <Helper
        storage={{
          beer: expectedResponse.storage.beer,
          bestBefore: expectedResponse.storage.bestBefore,
          container: expectedResponse.storage.container,
        }}
        handleResponse={handler}
      />
    </Provider>,
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(handler).toHaveBeenCalledWith(expectedResponse.storage)
  })
})
