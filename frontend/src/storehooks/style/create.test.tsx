import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest'
import { store } from '../../store/store'
import { createServer } from '../../../test-util/server'
import type { TestServer } from '../../../test-util/server'
import createStyle from './create'
import type { Style, CreateStyleRequest } from '../../types/style/types'
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
      <Button onClick={handleClick} text='Test' />
      <div>{create.createdStyle?.name}</div>
    </>
  )
}

test('create style', async () => {
  const user = setupUser()

  const expectedResponse: { style: Style } = {
    style: {
      id: '31c67c1d-58e3-4c26-b91e-6d1738757475',
      name: 'Test style',
    },
  }

  server?.addResponse<{ style: Style }>({
    method: 'POST',
    pathname: '/api/v1/style',
    response: expectedResponse,
    status: 201,
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper
        style={{ parents: [], name: expectedResponse.style.name }}
        handleResponse={() => undefined}
      />
    </Provider>,
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(getByText(expectedResponse.style.name)).toBeDefined()
  })
})
