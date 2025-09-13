import { expect, test } from 'vitest'
import { useState } from 'react'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import searchBreweries from './search'
import type { Brewery, BreweryList } from '../../core/brewery/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import userEvent from '@testing-library/user-event'

import Button from '../../components/common/Button'

function Helper(): React.JSX.Element {
  const searchIf = searchBreweries()
  const { search } = searchIf.useSearch()
  const [results, setResults] = useState<Brewery[]>([])
  const doSearch = async (): Promise<void> => {
    const result = await search('brewery')
    setResults(result)
  }
  return (
    <div>
      {results.map(brewery =>
        <div key={brewery.id}>{brewery.name}</div>
      )}
      <Button
        onClick={() => { void doSearch() }}
        text='Search'
      />
    </div>
  )
}

test('search breweries', async () => {
  const user = userEvent.setup()

  const expectedResponse = {
    breweries: [
      {
        id: '4104837d-e583-4acf-a731-5517ae0f910b',
        name: 'Test brewery'
      },
      {
        id: 'f8ab1ed0-0afa-4509-a826-aa0613e4e8e8',
        name: 'Another brewery'
      }
    ]
  }

  addTestServerResponse<BreweryList>({
    method: 'POST',
    pathname: `/api/v1/brewery/search`,
    response: expectedResponse,
    status: 200
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>
  )
  const loadButton = getByRole('button', { name: 'Search' })
  await user.click(loadButton)
  await waitFor(() => {
    expect(getByText(expectedResponse.breweries[0].name)).toBeDefined()
    expect(getByText(expectedResponse.breweries[1].name)).toBeDefined()
  })
})
