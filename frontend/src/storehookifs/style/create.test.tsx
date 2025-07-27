import { expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import createStyle from './create'
import type { Style, CreateStyleRequest } from '../../core/style/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

interface HelperProps {
  style: CreateStyleRequest
  handleResponse: (style: Style) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const createIf = createStyle()
  const create = createIf.useCreate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      await create.create(props.style)
    }
    void doHandle()
  }
  return (
    <>
      <button onClick={handleClick}>Test</button>
      <div>{create.createdStyle?.name}</div>
    </>
  )
}

test('create style', async () => {
  const user = userEvent.setup()

  const expectedResponse = {
    style: {
      id: '31c67c1d-58e3-4c26-b91e-6d1738757475',
      name: 'Test style'
    }
  }

  addTestServerResponse<{style: Style}>({
    method: 'POST',
    pathname: '/api/v1/style',
    response: expectedResponse,
    status: 201
  })

  const handler = vitest.fn()
  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper
        style={{ parents: [], name: expectedResponse.style.name }}
        handleResponse={
          handler
        }
      />
    </Provider>
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(getByText(expectedResponse.style.name)).toBeDefined()
  })
})
