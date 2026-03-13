import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listStoragesByStyle from './listByStyle'
import type { StorageList } from '../../core/storage/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

const dontCall = (): any => {
  throw new Error('must not be called')
}

interface Props {
  styleId: string
}

function Helper(props: Props): React.JSX.Element {
  const listIf = listStoragesByStyle({
    useDelete: dontCall
  })
  const { storages } = listIf.useList(props.styleId)
  return (
    <div>
      {storages?.storages.map(storage =>
        <div key={storage.id}>{storage.beerName}</div>
      )}
    </div>
  )
}

test('list storages by style', async () => {
  const styleId = '1251dd32-8ebc-4569-b2c5-5de303768c8d'

  const expectedResponse: StorageList = {
    storages: [
      {
        id: '270da853-33f3-4310-be27-43d0474ac163',
        beerId: '02323050-dcd2-4fbb-aa84-ac6910728f37',
        beerName: 'Test beer',
        bestBefore: '2026-12-31T10:00:00.000Z',
        breweries: [
          {
            id: 'd182f232-0f72-4615-963a-bbb6c448ea4f',
            name: 'Test brewery'
          }
        ],
        container: {
          id: '53892c47-3017-4694-8b70-df029dd4b2da',
          type: 'bottle',
          size: '0.50'
        },
        createdAt: '2026-03-13T10:00:00.000Z',
        hasReview: false,
        styles: [
          {
            id: styleId,
            name: 'Imperial Sour'
          }
        ]
      }
    ]
  }

  addTestServerResponse<StorageList>({
    method: 'GET',
    pathname: `/api/v1/style/${styleId}/storage`,
    response: expectedResponse,
    status: 200
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper styleId={styleId} />
    </Provider>
  )
  await waitFor(() => {
    expect(getByText(expectedResponse.storages[0].beerName)).toBeDefined()
  })
})
