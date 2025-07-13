import { expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import createBrewery from './create'
import type { Brewery, CreateBreweryRequest } from '../../core/brewery/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

interface HelperProps {
  brewery: CreateBreweryRequest
  handleResponse: (brewery: Brewery) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const createIf = createBrewery()
  const create = createIf.useCreate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      const response = await create.create(props.brewery)
      props.handleResponse(response)
    }
    void doHandle()
  }
  return (
    <button onClick={handleClick}>Test</button>
  )
}

test('create brewery', async () => {
  const user = userEvent.setup()

  const expectedResponse = {
    brewery: {
      id: '2e92c7c4-d1ee-41d3-acf5-18fd29e94233',
      name: 'Test brewery'
    }
  }

  addTestServerResponse<{brewery: Brewery}>({
    method: 'POST',
    pathname: '/api/v1/brewery',
    response: expectedResponse,
    status: 201
  })

  const handler = vitest.fn()
  const { getByRole } = render(
    <Provider store={store}>
      <Helper brewery={{ name: expectedResponse.brewery.name }} handleResponse={
        handler
      } />
    </Provider>
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(handler).toHaveBeenCalledWith(expectedResponse.brewery)
  })
})
