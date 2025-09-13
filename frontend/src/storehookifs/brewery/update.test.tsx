import { test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import updateBrewery from './update'
import type { Brewery } from '../../core/brewery/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

import Button from '../../components/common/Button'

interface HelperProps {
  brewery: Brewery
  handleResponse: (brewery: Brewery) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const updateIf = updateBrewery()
  const update = updateIf.useUpdate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      await update.update(props.brewery)
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
  const user = userEvent.setup()

  const expectedResponse = {
    brewery: {
      id: 'b20edb3f-ff2f-4303-9ed9-01b025dc3c49',
      name: 'Test brewery'
    }
  }

  addTestServerResponse<{brewery: Brewery}>({
    method: 'PUT',
    pathname: `/api/v1/brewery/${expectedResponse.brewery.id}`,
    response: expectedResponse,
    status: 200
  })

  const handler = vitest.fn()
  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper brewery={expectedResponse.brewery} handleResponse={
        handler
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
