import React from 'react'

import { expect, test, vitest } from 'vitest'
import { store } from '../src/store/store'
import { addTestServerResponse } from './server'
import createBeer from '../src/storehookifs/beer/create'
import type { BeerWithIds, CreateBeerRequest } from '../src/core/beer/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../src/react-redux-wrapper'

import Button from '../src/components/common/Button'

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
      try {
        await create.create(props.beer)
      } catch (e) {
        props.handleResponse(e)
      }
    }
    void doHandle()
  }
  return <Button onClick={handleClick} text='Test' />
}

test('test server responds with 500 to unexpected request', async () => {
  const user = userEvent.setup()

  const expectedResponse: { beer: BeerWithIds } = {
    beer: {
      id: '09901f8e-8a7d-47e7-8f7d-83068967ee72',
      name: 'Test beer',
      breweries: [],
      styles: [],
    },
  }

  addTestServerResponse<{ beer: BeerWithIds }>({
    method: 'POST',
    pathname: '/api/v1/thisiswrong',
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
  await waitFor(async () => {
    expect(handler).toHaveBeenCalledWith({
      data: {
        errorMessage:
          'Unexpected request with method POST to path /api/v1/beer',
      },
      status: 500,
    })
  })
})
