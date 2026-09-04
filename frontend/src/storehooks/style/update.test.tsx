import { beforeAll, beforeEach, afterAll, expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { createServer } from '../../../test-util/server'
import type { TestServer } from '../../../test-util/server'
import updateStyle from './update'
import type { StyleWithParentIds } from '../../types/style/types'
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
  style: StyleWithParentIds
  handler: () => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const updateIf = updateStyle()
  const update = updateIf.useUpdate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      await update.update(props.style)
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

test('update style', async () => {
  const user = setupUser()

  const expectedResponse: { style: StyleWithParentIds } = {
    style: {
      id: '8cc5fe99-8f76-4a53-933f-86494dc77e1e',
      name: 'Test style',
      parents: [],
    },
  }

  server?.addResponse<{ style: StyleWithParentIds }>({
    method: 'PUT',
    pathname: `/api/v1/style/${expectedResponse.style.id}`,
    response: expectedResponse,
    status: 200,
  })

  const handler = vitest.fn()
  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper style={expectedResponse.style} handler={handler} />
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
