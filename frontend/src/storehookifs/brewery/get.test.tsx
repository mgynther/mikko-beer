import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import getBrewery from './get'
import type { Brewery } from '../../core/brewery/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

interface HelperProps {
  breweryId: string
}

function Helper(props: HelperProps): React.JSX.Element {
  const getIf = getBrewery()
  const { brewery } = getIf.useGet(props.breweryId)
  return (
    <div>{brewery?.name}</div>
  )
}

test('get brewery', async () => {
  const expectedResponse = {
    brewery: {
      id: 'ef20147e-c396-48c6-a314-ceef15a42ca5',
      name: 'Test brewery'
    }
  }

  addTestServerResponse<{brewery: Brewery}>({
    method: 'GET',
    pathname: `/api/v1/brewery/${expectedResponse.brewery.id}`,
    response: expectedResponse,
    status: 200
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper breweryId={expectedResponse.brewery.id} />
    </Provider>
  )
  await waitFor(() => {
    expect(getByText(expectedResponse.brewery.name)).toBeDefined()
  })
})
