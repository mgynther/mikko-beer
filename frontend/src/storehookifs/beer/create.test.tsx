import { expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import createBeer from './create'
import type { BeerWithIds, CreateBeerRequest } from '../../core/beer/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

import Button from '../../components/common/Button'

const dontCall = (): any => {
  throw new Error('must not be called')
}

interface HelperProps {
  beer: CreateBeerRequest
  handleResponse: (beer: BeerWithIds) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const createIf = createBeer({
    selectBreweryIf: {
      create: {
        useCreate: dontCall,
      },
      search: {
        useSearch: dontCall,
      },
    },
    selectStyleIf: {
      create: {
        useCreate: dontCall,
      },
      list: {
        useList: dontCall,
      },
    },
  })
  const create = createIf.useCreate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      const response = await create.create(props.beer)
      props.handleResponse(response)
    }
    void doHandle()
  }
  return <Button onClick={handleClick} text='Test' />
}

test('create beer', async () => {
  const user = userEvent.setup()

  const expectedResponse: { beer: BeerWithIds } = {
    beer: {
      id: '09901f8e-8a7d-47e7-8f7d-83068967ee72',
      name: 'Test beer',
      breweries: ['3e1d805f-88d9-4619-aa3f-5684acef261f'],
      styles: ['3c66312c-b66b-4f5d-97d6-d2d5a3fc6835'],
    },
  }

  addTestServerResponse<{ beer: BeerWithIds }>({
    method: 'POST',
    pathname: '/api/v1/beer',
    response: expectedResponse,
    status: 201,
  })

  const handler = vitest.fn()
  const { getByRole } = render(
    <Provider store={store}>
      <Helper
        beer={{
          name: expectedResponse.beer.name,
          breweries: expectedResponse.beer.breweries,
          styles: expectedResponse.beer.styles,
        }}
        handleResponse={handler}
      />
    </Provider>,
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(handler).toHaveBeenCalledWith(expectedResponse.beer)
  })
})
