import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listStoragesByBrewery from './listByBrewery'
import type { StorageList } from '../../core/storage/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

const dontCall = (): any => {
  throw new Error('must not be called')
}

interface Props {
  breweryId: string
}

function Helper(props: Props): React.JSX.Element {
  const listIf = listStoragesByBrewery({
    useDelete: dontCall
  })
  const { storages } = listIf.useList(props.breweryId)
  return (
    <div>
      {storages?.storages.map(storage =>
        <div key={storage.id}>{storage.beerName}</div>
      )}
    </div>
  )
}

test('list storages by brewery', async () => {
  const breweryId = 'a31ff1b2-1164-4a00-ac9c-b5174b64fee4'

  const expectedResponse: StorageList = {
    storages: [
      {
        id: 'f806982f-4f1e-492d-9416-cd593acae4da',
        beerId: '4983c072-531a-4d45-bf19-83ea590820e3',
        beerName: 'Test beer',
        bestBefore: '2025-02-03T10:00:00.000Z',
        breweries: [
          {
            id: breweryId,
            name: 'Test brewery'
          }
        ],
        container: {
          id: '329439c4-faac-43dc-8b0b-9f0bcfeb51e8',
          type: 'bottle',
          size: '0.33'
        },
        createdAt: '2024-09-28T10:00:00.000Z',
        hasReview: false,
        styles: [
          {
            id: 'febaf66f-f9e0-4042-94ac-280d4b29b83a',
            name: 'Imperial Stout'
          }
        ]
      }
    ]
  }

  addTestServerResponse<StorageList>({
    method: 'GET',
    pathname: `/api/v1/brewery/${breweryId}/storage`,
    response: expectedResponse,
    status: 200
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper breweryId={breweryId} />
    </Provider>
  )
  await waitFor(() => {
    expect(getByText(expectedResponse.storages[0].beerName)).toBeDefined()
  })
})
