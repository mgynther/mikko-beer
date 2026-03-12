import { expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import createStorage from './create'
import type {
  CreateStorageRequest,
  Storage
} from '../../core/storage/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

import Button from '../../components/common/Button'

interface HelperProps {
  storage: CreateStorageRequest
  handleResponse: (storage: Storage) => void
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
  return (
    <Button onClick={handleClick} text='Test' />
  )
}

test('create storage', async () => {
  const user = userEvent.setup()

  const expectedResponse: { storage: Storage } = {
    storage: {
      id: '16a507d9-e6c7-4405-8bb7-a4bb0cbe97a4',
      beerId: '30111f34-eceb-44ea-9b21-6c5b50b91a79',
      beerName: 'Test beer',
      bestBefore: '2027-01-01T00:00:00.000Z',
      breweries: [{
        id: 'f4f2ec3d-f686-468d-a811-dbc3a495571a',
        name: 'Test brewery'
      }],
      container: {
        id: '4ced8689-13f2-48de-aaa7-749ee509336d',
        type: 'bottle',
        size: '0.33'
      },
      createdAt: '2026-03-12T00:00:00.000Z',
      hasReview: false,
      styles: [{
        id: '5e3cf039-9f9e-4587-bf92-cbdf90cf5ca7',
        name: 'Test style'
      }]
    }
  }

  addTestServerResponse<{ storage: Storage }>({
    method: 'POST',
    pathname: '/api/v1/storage',
    response: expectedResponse,
    status: 201
  })

  const handler = vitest.fn()
  const { getByRole } = render(
    <Provider store={store}>
      <Helper storage={{
        beer: expectedResponse.storage.beerId,
        bestBefore: expectedResponse.storage.bestBefore,
        container: expectedResponse.storage.container.id
      }} handleResponse={handler} />
    </Provider>
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(handler).toHaveBeenCalledWith(expectedResponse.storage)
  })
})
