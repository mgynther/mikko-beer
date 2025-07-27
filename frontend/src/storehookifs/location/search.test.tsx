import { expect, test } from 'vitest'
import { useState } from 'react'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import searchLocations from './search'
import type { Location, LocationList } from '../../core/location/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import userEvent from '@testing-library/user-event'

function Helper(): React.JSX.Element {
  const searchIf = searchLocations({
      useCreate: () => ({
        create: async () => ({
          id: '32f585d2-aeb8-46bb-91b9-ab57bc5e8b11',
          name: 'Fake created location'
        }),
        isLoading: false
      })
  })
  const { search } = searchIf.useSearch()
  const [results, setResults] = useState<Location[]>([])
  const doSearch = async (): Promise<void> => {
    const result = await search('location')
    setResults(result)
  }
  return (
    <div>
      {results.map(location =>
        <div key={location.id}>{location.name}</div>
      )}
      <button
        onClick={() => { void doSearch() }}
      >
        Search
      </button>
    </div>
  )
}

test('search locations', async () => {
  const user = userEvent.setup()

  const expectedResponse = {
    locations: [
      {
        id: 'b8acbeae-ba8c-4088-a352-db6dd365bea8',
        name: 'Test location'
      },
      {
        id: 'e28d2550-67bc-40cf-8f12-b405d324376e',
        name: 'Another location'
      }
    ]
  }

  addTestServerResponse<LocationList>({
    method: 'POST',
    pathname: `/api/v1/location/search`,
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
    expect(getByText(expectedResponse.locations[0].name)).toBeDefined()
    expect(getByText(expectedResponse.locations[1].name)).toBeDefined()
  })
})
