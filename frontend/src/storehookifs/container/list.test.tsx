import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listContainers from './list'
import type { ContainerList } from '../../core/container/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

function Helper(): React.JSX.Element {
  const listIf = listContainers()
  const { data } = listIf.useList()
  return (
    <div>
      {data?.containers.map(container =>
        <div key={container.id}>{container.type} {container.size}</div>
      )}
    </div>
  )
}

test('list containers', async () => {
  const expectedResponse = {
    containers: [
      {
        id: '655a8095-5dc5-4e7e-a461-b543d6d3fbaa',
        type: 'draft',
        size: '0.10'
      },
      {
        id: 'f70e0233-6ca9-4899-8a88-fa0c0e718a49',
        type: 'can',
        size: '0.44'
      }
    ]
  }

  addTestServerResponse<ContainerList>({
    method: 'GET',
    pathname: `/api/v1/container`,
    response: expectedResponse,
    status: 200
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>
  )
  await waitFor(() => {
    const [ firstContainer, secondContainer ] = expectedResponse.containers
    expect(
      getByText(`${firstContainer.type} ${firstContainer.size}`)
    ).toBeDefined()
    expect(
      getByText(`${secondContainer.type} ${secondContainer.size}`)
    ).toBeDefined()
  })
})
