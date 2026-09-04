import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest'
import { useState } from 'react'
import { store } from '../../store/store'
import { createServer } from '../../../test-util/server'
import type { TestServer } from '../../../test-util/server'
import searchLocations from './search'
import type { Location, LocationList } from '../../types/location/types'
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
  const searchFieldIf = searchLocations()
  const { search } = searchFieldIf.useSearch()
  const [results, setResults] = useState<Location[]>([])
  const doSearch = async (): Promise<void> => {
    const result = await search('location')
    setResults(result)
  }
  return (
    <div>
      {results.map((location) => (
        <div key={location.id}>{location.name}</div>
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

test('search locations', async () => {
  const user = setupUser()

  const expectedResponse: LocationList = {
    locations: [
      {
        id: 'b8acbeae-ba8c-4088-a352-db6dd365bea8',
        name: 'Test location',
      },
      {
        id: 'e28d2550-67bc-40cf-8f12-b405d324376e',
        name: 'Another location',
      },
    ],
  }

  server?.addResponse<LocationList>({
    method: 'POST',
    pathname: `/api/v1/location/search`,
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
    expect(getByText(expectedResponse.locations[0].name)).toBeDefined()
    expect(getByText(expectedResponse.locations[1].name)).toBeDefined()
  })
})
