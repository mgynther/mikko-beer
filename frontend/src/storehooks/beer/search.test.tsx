import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest'
import { useState } from 'react'
import { store } from '../../store/store'
import { createServer } from '../../../test-util/server'
import type { TestServer } from '../../../test-util/server'
import searchBeer from './search'
import type { Beer, BeerList } from '../../types/beer/types'
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
  const searchBeerIf = searchBeer()
  const { search } = searchBeerIf.useSearch()
  const [results, setResults] = useState<Beer[]>([])
  const doSearch = async (): Promise<void> => {
    const result = await search('beer')
    setResults(result)
  }
  return (
    <div>
      {results.map((beer) => (
        <div key={beer.id}>{beer.name}</div>
      ))}
      <Button
        onClick={() => {
          void doSearch()
        }}
        text='Search'
      />
    </div>
  )
}

test('search beers', async () => {
  const user = setupUser()

  const expectedResponse: BeerList = {
    beers: [
      {
        id: '3939ffc3-0393-483a-9f52-f4f9fadac341',
        name: 'Test beer',
        breweries: [
          {
            id: '5b9d875f-24ec-4907-8747-ca78dddab48b',
            name: 'Test brewery',
          },
        ],
        styles: [
          {
            id: 'c16f1a4c-d14d-497c-a5af-580f02f38531',
            name: 'Test style',
          },
        ],
      },
      {
        id: 'e0d1e625-069a-437f-aa0e-900ebcc7ff1d',
        name: 'Another beer',
        breweries: [
          {
            id: '13418552-4985-4c72-ae00-912632585763',
            name: 'Another brewery',
          },
        ],
        styles: [
          {
            id: '5e65701b-59f9-4da2-90f5-71284c323db3',
            name: 'Another style',
          },
        ],
      },
    ],
  }

  server?.addResponse<BeerList>({
    method: 'POST',
    pathname: `/api/v1/beer/search`,
    response: expectedResponse,
    status: 200,
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>,
  )
  const loadButton = getByRole('button', { name: 'Search' })
  await user.click(loadButton)
  await waitFor(() => {
    expect(getByText(expectedResponse.beers[0].name)).toBeDefined()
    expect(getByText(expectedResponse.beers[1].name)).toBeDefined()
  })
})
