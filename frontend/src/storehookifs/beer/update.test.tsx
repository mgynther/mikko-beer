import { expect, test, vitest } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import updateBeer from './update'
import type { BeerWithIds } from '../../core/beer/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

import Button from '../../components/common/Button'

const dontCall = (): any => {
  throw new Error('must not be called')
}

interface HelperProps {
  beer: BeerWithIds
  handleResponse: () => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const updateIf = updateBeer({
    selectBreweryIf: {
      create: {
        useCreate: dontCall
      },
      search: {
        useSearch: dontCall
      }
    },
    selectStyleIf: {
      create: {
        useCreate: dontCall
      },
      list: {
        useList: dontCall
      }
    }
  })
  const update = updateIf.useUpdate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      await update.update(props.beer)
      props.handleResponse()
    }
    void doHandle()
  }
  return (
    <>
      <Button onClick={handleClick} text='Test' />
      {update.isLoading && <div>Loading</div>}
      {!update.isLoading && <div>Not loading</div>}
    </>
  )
}

test('update beer', async () => {
  const user = userEvent.setup()

  const expectedResponse: { beer: BeerWithIds } = {
    beer: {
      id: '6a3c37df-8aa8-4590-a779-5ae37f2867b9',
      name: 'Test beer',
      breweries: ['599585b2-e62d-4898-a373-9253ce99903a'],
      styles: ['2436c303-57c9-477f-ae8f-9005e7b66b7b']
    }
  }

  addTestServerResponse<{beer: BeerWithIds}>({
    method: 'PUT',
    pathname: `/api/v1/beer/${expectedResponse.beer.id}`,
    response: expectedResponse,
    status: 200
  })

  const handler = vitest.fn()
  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper
        beer={expectedResponse.beer}
        handleResponse={handler}
      />
    </Provider>
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(handler).toHaveBeenCalled()
  })
  expect(getByText('Not loading')).toBeDefined()
})
