import { test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import updateStyle from './update'
import type { StyleWithParentIds } from '../../core/style/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

import Button from '../../components/common/Button'

interface HelperProps {
  style: StyleWithParentIds
  handleResponse: (style: StyleWithParentIds) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const updateIf = updateStyle()
  const update = updateIf.useUpdate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      await update.update(props.style)
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

test('update style', async () => {
  const user = userEvent.setup()

  const expectedResponse = {
    style: {
      id: '8cc5fe99-8f76-4a53-933f-86494dc77e1e',
      name: 'Test style',
      parents: []
    }
  }

  addTestServerResponse<{style: StyleWithParentIds}>({
    method: 'PUT',
    pathname: `/api/v1/style/${expectedResponse.style.id}`,
    response: expectedResponse,
    status: 200
  })

  const handler = vitest.fn()
  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper style={expectedResponse.style} handleResponse={
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
