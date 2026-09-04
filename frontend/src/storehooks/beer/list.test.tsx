import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest'
import { store } from '../../store/store'
import { createServer } from '../../../test-util/server'
import type { TestServer } from '../../../test-util/server'
import listBeers from './list'
import type { BeerList } from '../../types/beer/types'
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
  const listIf = listBeers()
  const { list, beerList } = listIf.useList()
  return (
    <div>
      {beerList?.beers.map((beer) => (
        <div key={beer.id}>{beer.name}</div>
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

test('list beers', async () => {
  const user = setupUser()

  const expectedResponse: BeerList = {
    beers: [
      {
        id: 'fd049205-563e-440e-b430-3dfe1e03d901',
        name: 'Test beer',
        breweries: [
          {
            id: '0481b29e-748a-42ba-a237-57fb27e897ed',
            name: 'Test brewery',
          },
        ],
        styles: [
          {
            id: 'dd7e3569-4cb8-4508-b75f-53c03d7e3369',
            name: 'Test style',
          },
        ],
      },
      {
        id: 'e9414263-9006-4288-80bf-6430182a04c9',
        name: 'Another beer',
        breweries: [
          {
            id: 'af8c2762-d14c-449d-87c7-a1e52f2abdfb',
            name: 'Another brewery',
          },
        ],
        styles: [
          {
            id: 'ca3f4ed1-b598-41ad-ab1c-6f7a5c968f28',
            name: 'Another style',
          },
        ],
      },
    ],
  }

  server?.addResponse<BeerList>({
    method: 'GET',
    pathname: `/api/v1/beer?size=10&skip=0`,
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
    expect(getByText(expectedResponse.beers[0].name)).toBeDefined()
    expect(getByText(expectedResponse.beers[1].name)).toBeDefined()
  })
})
