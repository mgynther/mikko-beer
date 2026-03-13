import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listStorages from './list'
import type { StorageList } from '../../core/storage/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

const dontCall = (): any => {
  throw new Error('must not be called')
}

function Helper(): React.JSX.Element {
  const listIf = listStorages({
    useDelete: dontCall
  })
  const { storages } = listIf.useList()
  return (
    <div>
      {storages?.storages.map(storage =>
        <div key={storage.id}>{storage.beerName}</div>
      )}
    </div>
  )
}

test('list storages', async () => {
  const expectedResponse: StorageList = {
    storages: [
      {
        id: '896b7a5f-715c-4fa2-89d3-c0af91e902ea',
        beerId: '2ecb1795-a6a2-4b4a-a7a5-c5f3cc459857',
        beerName: 'Test beer',
        bestBefore: '2025-12-10T12:00:00.000Z',
        breweries: [{
          id: 'b065774f-32ad-45d0-95f6-289716a4441d',
          name: 'Test brewery'
        }],
        container: {
          id: '40572dbf-9336-4ac4-9a3a-958147a97c3e',
          type: 'can',
          size: '0.44'
        },
        createdAt: '2024-02-03T12:00:00.000Z',
        hasReview: false,
        styles: [{
          id: 'ee926cb7-1e23-4a26-8e9b-d2ac42d817b2',
          name: 'Test style'
        }]
      },
      {
        id: '74260c4e-366c-4e35-89ef-052cb813db04',
        beerId: '040483ad-e2c9-4bbf-90ee-60cc8efadfc2',
        beerName: 'Another beer',
        bestBefore: '2025-03-04T12:00:00.000Z',
        breweries: [{
          id: '2a870b29-9f2d-4f62-bc05-aa6df676510e',
          name: 'Another brewery'
        }],
        container: {
          id: '2aaa8d00-01e7-4179-aa3b-588a542e1c7b',
          type: 'bottle',
          size: '0.50'
        },
        createdAt: '2025-10-12T12:00:00.000Z',
        hasReview: false,
        styles: [{
          id: 'd9bc09f9-e1c7-437b-87e5-9dc04d6fcc37',
          name: 'Another style'
        }]
      }
    ]
  }

  addTestServerResponse<StorageList>({
    method: 'GET',
    pathname: `/api/v1/storage`,
    response: expectedResponse,
    status: 200
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>
  )
  await waitFor(() => {
    expect(getByText(expectedResponse.storages[0].beerName)).toBeDefined()
    expect(getByText(expectedResponse.storages[1].beerName)).toBeDefined()
  })
})
