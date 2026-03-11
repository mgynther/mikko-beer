import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import getBeer from './get'
import type { Beer } from '../../core/beer/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

interface HelperProps {
  beerId: string
}

function Helper(props: HelperProps): React.JSX.Element {
  const getIf = getBeer()
  const { beer } = getIf.useGetBeer(props.beerId)
  return (
    <div>{beer?.name}</div>
  )
}

test('get beer', async () => {
  const expectedResponse: { beer: Beer } = {
    beer: {
      id: 'ef20147e-c396-48c6-a314-ceef15a42ca5',
      name: 'Test beer',
      breweries: [{
        id: 'e0bd0f1a-da5f-4fff-94fc-c2bd7ee79b3c',
        name: 'Test brewery'
      }],
      styles: [{
        id: '76c407e6-9028-4eb7-9cad-b3a2c0df58f7',
        name: 'Test style'
      }]
    }
  }

  addTestServerResponse<{beer: Beer}>({
    method: 'GET',
    pathname: `/api/v1/beer/${expectedResponse.beer.id}`,
    response: expectedResponse,
    status: 200
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper beerId={expectedResponse.beer.id} />
    </Provider>
  )
  await waitFor(() => {
    expect(getByText(expectedResponse.beer.name)).toBeDefined()
  })
})
