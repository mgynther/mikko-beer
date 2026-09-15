import { beforeAll, beforeEach, afterAll, expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { createServer } from '../../../test-util/server'
import type { TestServer } from '../../../test-util/server'
import updateBrewery from './update'
import type { Brewery } from '../../types/brewery/types'
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
  brewery: Brewery
  handler: () => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const updateIf = updateBrewery()
  const update = updateIf.useUpdate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      await update.update(props.brewery)
      props.handler()
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

test('update brewery', async () => {
  const user = setupUser()

  const expectedResponse: { brewery: Brewery } = {
    brewery: {
      id: 'b20edb3f-ff2f-4303-9ed9-01b025dc3c49',
      name: 'Test brewery',
      country: 'FI',
    },
  }

  server?.addResponse<{ brewery: Brewery }>({
    method: 'PUT',
    pathname: `/api/v1/brewery/${expectedResponse.brewery.id}`,
    response: expectedResponse,
    status: 200,
  })

  const handler = vitest.fn()
  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper brewery={expectedResponse.brewery} handler={handler} />
    </Provider>,
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(handler).toHaveBeenCalled()
  })
  await waitFor(() => {
    expect(getByText('Not loading')).toBeDefined()
  })
})
