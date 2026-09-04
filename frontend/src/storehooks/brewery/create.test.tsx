import { beforeAll, beforeEach, afterAll, expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { createServer } from '../../../test-util/server'
import type { TestServer } from '../../../test-util/server'
import createBrewery from './create'
import type { Brewery, CreateBreweryRequest } from '../../types/brewery/types'
import { render, waitFor } from '@testing-library/react'
import { setupUser } from '../../../test-util/user-event'
import { Provider } from '../../react-redux-wrapper'

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
  return <Button onClick={handleClick} text='Test' />
}

test('create brewery', async () => {
  const user = setupUser()

  const expectedResponse: { brewery: Brewery } = {
    brewery: {
      id: '2e92c7c4-d1ee-41d3-acf5-18fd29e94233',
      name: 'Test brewery',
    },
  }

  server?.addResponse<{ brewery: Brewery }>({
    method: 'POST',
    pathname: '/api/v1/brewery',
    response: expectedResponse,
    status: 201,
  })

  const handler = vitest.fn()
  const { getByRole } = render(
    <Provider store={store}>
      <Helper
        brewery={{ name: expectedResponse.brewery.name }}
        handleResponse={handler}
      />
    </Provider>,
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(handler).toHaveBeenCalledWith(expectedResponse.brewery)
  })
})
