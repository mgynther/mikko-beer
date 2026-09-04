import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest'
import { store } from '../../store/store'
import { createServer } from '../../../test-util/server'
import type { TestServer } from '../../../test-util/server'
import listLocations from './list'
import type { LocationList } from '../../types/location/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import { setupUser } from '../../../test-util/user-event'

import Button from '../../components/common/Button'

let server: TestServer | undefined

beforeAll(() => {
  server = createServer()
})

beforeEach(() => {
  server?.clear()
})

afterAll(() => {
  server?.close()
})

function Helper(): React.JSX.Element {
  const listIf = listLocations()
  const { list, locationList } = listIf.useList()
  return (
    <div>
      {locationList?.locations.map((location) => (
        <div key={location.id}>{location.name}</div>
      ))}
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
  const user = setupUser()

  const expectedResponse: LocationList = {
    locations: [
      {
        id: 'd0fcd6db-f26e-4eb6-b4ab-632769fc6ce5',
        name: 'Test location',
      },
      {
        id: '2587d055-c844-47ca-8885-4713a07394f1',
        name: 'Another location',
      },
    ],
  }

  server?.addResponse<LocationList>({
    method: 'GET',
    pathname: `/api/v1/location?size=10&skip=0`,
    response: expectedResponse,
    status: 200,
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>,
  )
  const loadButton = getByRole('button', { name: 'Load' })
  await user.click(loadButton)
  await waitFor(() => {
    expect(getByText(expectedResponse.locations[0].name)).toBeDefined()
    expect(getByText(expectedResponse.locations[1].name)).toBeDefined()
  })
})
