import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest'
import { store } from '../../store/store'
import { createServer } from '../../../test-util/server'
import type { TestServer } from '../../../test-util/server'
import listBreweries from './list'
import type { BreweryList } from '../../types/brewery/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import { setupUser } from '../../../test-util/user-event'

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

function Helper(): React.JSX.Element {
  const listIf = listBreweries()
  const { list, breweryList } = listIf.useList()
  return (
    <div>
      {breweryList?.breweries.map((brewery) => (
        <div key={brewery.id}>{brewery.name}</div>
      ))}
      <Button
        onClick={() => {
          void list({ skip: 0, size: 10 })
        }}
        text='Load'
      />
    </div>
  )
}

test('list breweries', async () => {
  const user = setupUser()

  const expectedResponse: BreweryList = {
    breweries: [
      {
        id: 'eadee3b4-5b47-49a2-a2f6-6719c83b1a0e',
        name: 'Test brewery',
      },
      {
        id: '7326edd5-b1e8-489a-b5fc-902de0095bd5',
        name: 'Another brewery',
      },
    ],
  }

  server?.addResponse<BreweryList>({
    method: 'GET',
    pathname: `/api/v1/brewery?size=10&skip=0`,
    response: expectedResponse,
    status: 200,
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>,
  )
  const loadButton = getByRole('button', { name: 'Load' })
  await user.click(loadButton)
  await waitFor(() => {
    expect(getByText(expectedResponse.breweries[0].name)).toBeDefined()
    expect(getByText(expectedResponse.breweries[1].name)).toBeDefined()
  })
})
