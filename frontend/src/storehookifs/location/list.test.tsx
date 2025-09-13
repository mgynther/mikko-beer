import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listLocations from './list'
import type { LocationList } from '../../core/location/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import userEvent from '@testing-library/user-event'

import Button from '../../components/common/Button'

function Helper(): React.JSX.Element {
  const listIf = listLocations()
  const { list, locationList } = listIf.useList()
  return (
    <div>
      {locationList?.locations.map(location =>
        <div key={location.id}>{location.name}</div>
      )}
      <Button
        onClick={() => {
          void list({ skip: 0, size: 10 })
        }}
        text='Load'
      />
    </div>
  )
}

test('list locations', async () => {
  const user = userEvent.setup()

  const expectedResponse = {
    locations: [
      {
        id: 'd0fcd6db-f26e-4eb6-b4ab-632769fc6ce5',
        name: 'Test location'
      },
      {
        id: '2587d055-c844-47ca-8885-4713a07394f1',
        name: 'Another location'
      }
    ]
  }

  addTestServerResponse<LocationList>({
    method: 'GET',
    pathname: `/api/v1/location?size=10&skip=0`,
    response: expectedResponse,
    status: 200
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>
  )
  const loadButton = getByRole('button', { name: 'Load' })
  await user.click(loadButton)
  await waitFor(() => {
    expect(getByText(expectedResponse.locations[0].name)).toBeDefined()
    expect(getByText(expectedResponse.locations[1].name)).toBeDefined()
  })
})
