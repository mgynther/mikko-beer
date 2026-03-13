import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listStoragesByBeer from './listByBeer'
import type { StorageList } from '../../core/storage/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

const dontCall = (): any => {
  throw new Error('must not be called')
}

interface Props {
  beerId: string
}

function Helper(props: Props): React.JSX.Element {
  const listIf = listStoragesByBeer({
    useDelete: dontCall
  })
  const { storages } = listIf.useList(props.beerId)
  return (
    <div>
      {storages?.storages.map(storage =>
        <div key={storage.id}>{storage.beerName}</div>
      )}
    </div>
  )
}

test('list storages by beer', async () => {
  const beerId = 'fb2f6f06-06db-44ad-b354-98db386ce6c6'

  const expectedResponse: StorageList = {
    storages: [
      {
        id: 'f806982f-4f1e-492d-9416-cd593acae4da',
        beerId,
        beerName: 'Test beer',
        bestBefore: '2026-12-31T10:00:00.000Z',
        breweries: [
          {
            id: 'f23ab165-f64a-4fb6-b4a5-1261b6c5cc70',
            name: 'Test brewery'
          }
        ],
        container: {
          id: '1b321b3c-2b85-446e-86f4-7bcd50884b59',
          type: 'bottle',
          size: '0.50'
        },
        createdAt: '2026-03-13T10:00:00.000Z',
        hasReview: false,
        styles: [
          {
            id: '9178fd5b-5067-47e2-b45e-542fd8940bfd',
            name: 'IPA'
          }
        ]
      }
    ]
  }

  addTestServerResponse<StorageList>({
    method: 'GET',
    pathname: `/api/v1/beer/${beerId}/storage`,
    response: expectedResponse,
    status: 200
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper beerId={beerId} />
    </Provider>
  )
  await waitFor(() => {
    expect(getByText(expectedResponse.storages[0].beerName)).toBeDefined()
  })
})
