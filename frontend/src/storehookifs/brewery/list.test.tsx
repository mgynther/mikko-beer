import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listBreweries from './list'
import type { BreweryList } from '../../core/brewery/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'
import userEvent from '@testing-library/user-event'

function Helper(): React.JSX.Element {
  const listIf = listBreweries()
  const { list, breweryList } = listIf.useList()
  return (
    <div>
      {breweryList?.breweries.map(brewery =>
        <div key={brewery.id}>{brewery.name}</div>
      )}
      <button
        onClick={() => {
          void list({ skip: 0, size: 10 })
        }}
      >
        Load
      </button>
    </div>
  )
}

test('list breweries', async () => {
  const user = userEvent.setup()

  const expectedResponse = {
    breweries: [
      {
        id: 'eadee3b4-5b47-49a2-a2f6-6719c83b1a0e',
        name: 'Test brewery'
      },
      {
        id: '7326edd5-b1e8-489a-b5fc-902de0095bd5',
        name: 'Another brewery'
      }
    ]
  }

  addTestServerResponse<BreweryList>({
    method: 'GET',
    pathname: `/api/v1/brewery?size=10&skip=0`,
    response: expectedResponse,
    status: 200
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>
  )
  const loadButton = getByRole('button', { name: 'Load' })
  await user.click(loadButton)
  await waitFor(() => {
    expect(getByText(expectedResponse.breweries[0].name)).toBeDefined()
    expect(getByText(expectedResponse.breweries[1].name)).toBeDefined()
  })
})
