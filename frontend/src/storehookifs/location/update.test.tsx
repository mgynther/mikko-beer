import { test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import updateLocation from './update'
import type { Location } from '../../core/location/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

import Button from '../../components/common/Button'

interface HelperProps {
  location: Location
  handleResponse: (location: Location) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const updateIf = updateLocation(() => ({
    user: undefined,
    authToken: '',
    refreshToken: ''
  }))
  const update = updateIf.useUpdate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      await update.update(props.location)
    }
    void doHandle()
  }
  return (
    <>
      <Button onClick={handleClick} text='Test' />
      {update.isLoading && <div>Loading</div>}
      {!update.isLoading && <div>Not loading</div>}
    </>
  )
}

test('update location', async () => {
  const user = userEvent.setup()

  const expectedResponse = {
    location: {
      id: '640ced88-a5b4-498e-9007-a045e0cc1797',
      name: 'Test location'
    }
  }

  addTestServerResponse<{location: Location}>({
    method: 'PUT',
    pathname: `/api/v1/location/${expectedResponse.location.id}`,
    response: expectedResponse,
    status: 200
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper location={expectedResponse.location} handleResponse={
        () => undefined
      } />
    </Provider>
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    getByText('Loading')
  })
  await waitFor(() => {
    getByText('Not loading')
  })
})
