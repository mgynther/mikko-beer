import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listStyles from './list'
import type { StyleList } from '../../core/style/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

function Helper(): React.JSX.Element {
  const listIf = listStyles()
  const { styles } = listIf.useList()
  return (
    <div>
      {styles?.map(style =>
        <div key={style.id}>{style.name}</div>
      )}
    </div>
  )
}

test('list styles', async () => {
  const expectedResponse = {
    styles: [
      {
        id: '00e6b36b-f430-4fc9-9f13-0b8888987038',
        name: 'Test style',
        parents: []
      },
      {
        id: '859e872a-07b8-40ca-845c-1feddda59c2a',
        name: 'Another style',
        parents: []
      }
    ]
  }

  addTestServerResponse<StyleList>({
    method: 'GET',
    pathname: `/api/v1/style`,
    response: expectedResponse,
    status: 200
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>
  )
  await waitFor(() => {
    const [firstStyle, secondStyle] = expectedResponse.styles
    expect(getByText(firstStyle.name)).toBeDefined()
    expect(getByText(secondStyle.name)).toBeDefined()
  })
})
