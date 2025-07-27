import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import getStyle from './get'
import type { StyleWithParentsAndChildren } from '../../core/style/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

interface HelperProps {
  styleId: string
}

function Helper(props: HelperProps): React.JSX.Element {
  const getIf = getStyle()
  const { style } = getIf.useGet(props.styleId)
  return (
    <div>{style?.name}</div>
  )
}

test('get style', async () => {
  const expectedResponse = {
    style: {
      id: 'bb6a57f4-f26e-4512-9235-4991ebc00ba9',
      name: 'Test style',
      parents: [],
      children: []
    }
  }

  addTestServerResponse<{style: StyleWithParentsAndChildren}>({
    method: 'GET',
    pathname: `/api/v1/style/${expectedResponse.style.id}`,
    response: expectedResponse,
    status: 200
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper styleId={expectedResponse.style.id} />
    </Provider>
  )
  await waitFor(() => {
    expect(getByText(expectedResponse.style.name)).toBeDefined()
  })
})
