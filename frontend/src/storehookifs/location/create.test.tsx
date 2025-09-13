import { expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import createLocation from './create'
import type { Location, CreateLocationRequest } from '../../core/location/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

import Button from '../../components/common/Button'

interface HelperProps {
  location: CreateLocationRequest
  handleResponse: (location: Location) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const createIf = createLocation()
  const create = createIf.useCreate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      const response = await create.create(props.location)
      props.handleResponse(response)
    }
    void doHandle()
  }
  return (
    <Button onClick={handleClick} text='Test' />
  )
}

test('create location', async () => {
  const user = userEvent.setup()

  const expectedResponse = {
    location: {
      id: 'c053e116-53e3-4de4-8273-e35158d776b7',
      name: 'Test location'
    }
  }

  addTestServerResponse<{location: Location}>({
    method: 'POST',
    pathname: '/api/v1/location',
    response: expectedResponse,
    status: 201
  })

  const handler = vitest.fn()
  const { getByRole } = render(
    <Provider store={store}>
      <Helper
        location={{ name: expectedResponse.location.name }}
        handleResponse={
          handler
        }
      />
    </Provider>
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(handler).toHaveBeenCalledWith(expectedResponse.location)
  })
})
