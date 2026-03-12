import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import getStorage from './get'
import type { Storage } from '../../core/storage/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

interface HelperProps {
  storageId: string
}

function Helper(props: HelperProps): React.JSX.Element {
  const getIf = getStorage()
  const { storage } = getIf.useGet(props.storageId)
  return (
    <div>{storage?.beerName}</div>
  )
}

test('get storage', async () => {
  const expectedResponse: { storage: Storage } = {
    storage: {
      id: 'f31e011c-e158-46b7-af46-9414ef492a09',
      beerId: 'b53f50a0-942a-4392-b38e-54c151eda773',
      beerName: 'Test beer',
      bestBefore: '2027-01-01T00:00:00.000Z',
      breweries: [{
        id: '2dad3097-8505-4e18-8e79-86e708b0db69',
        name: 'Test brewery'
      }],
      container: {
        id: 'e68022b8-f3a8-4bcc-bf1e-2cf5165e2c3e',
        type: 'bottle',
        size: '0.33'
      },
      createdAt: '2026-03-12T00:00:00.000Z',
      hasReview: false,
      styles: [{
        id: 'b32292b7-0dad-4442-8120-6cb5353e97aa',
        name: 'Test style'
      }]
    }
  }

  addTestServerResponse<{ storage: Storage }>({
    method: 'GET',
    pathname: `/api/v1/storage/${expectedResponse.storage.id}`,
    response: expectedResponse,
    status: 200
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper storageId={expectedResponse.storage.id} />
    </Provider>
  )
  await waitFor(() => {
    expect(getByText(expectedResponse.storage.beerName)).toBeDefined()
  })
})
