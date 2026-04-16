import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import getLocation from './get'
import type { Location } from '../../core/location/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

interface HelperProps {
  locationId: string
}

function Helper(props: HelperProps): React.JSX.Element {
  const getIf = getLocation()
  const { isLoading, location } = getIf.useGet(props.locationId)
  return (
    <>
      <div>{location?.name}</div>
      {!isLoading && location === undefined && <div>Failed</div>}
    </>
  )
}

test('get location', async () => {
  const expectedResponse: { location: Location } = {
    location: {
      id: '38ba5e94-5807-4fe5-ba85-f2580895a4fc',
      name: 'Test location',
    },
  }

  addTestServerResponse<{ location: Location }>({
    method: 'GET',
    pathname: `/api/v1/location/${expectedResponse.location.id}`,
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper locationId={expectedResponse.location.id} />
    </Provider>,
  )
  await waitFor(() => {
    expect(getByText(expectedResponse.location.name)).toBeDefined()
  })
})

test('try to get location that does not exist', async () => {
  const locationId = '87b4a36e-dcd9-4f54-8951-3da05fdc29f1'
  type ErrorResponse = { error: { code: string; message: string } }
  const expectedResponse: ErrorResponse = {
    error: {
      code: `LocationNotFound`,
      message: `location with id ${locationId}`,
    },
  }

  addTestServerResponse<ErrorResponse>({
    method: 'GET',
    pathname: `/api/v1/location/${locationId}`,
    response: expectedResponse,
    status: 404,
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper locationId={locationId} />
    </Provider>,
  )
  await waitFor(() => {
    expect(getByText('Failed')).toBeDefined()
  })
})
