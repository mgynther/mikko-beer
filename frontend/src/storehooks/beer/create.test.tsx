import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import createBeer from './create'
import type {
  BeerWithIds,
  CreateBeerRequest,
  UseCreateBeer,
  ValidateBeerWithIds,
} from './types'
import { setupUser } from '../../../test-util/user-event'
import { createErrorLogger } from '../../../test-util/error-logger'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedBeer: BeerWithIds = {
  id: 'f0e1d2c3-b4a5-4968-8172-6a5b4c3d2e1f',
  name: 'Validated beer',
  breweries: [],
  styles: [],
}

const created = { beer: { id: 'created', name: 'Created beer' } }

const request: CreateBeerRequest = {
  name: 'Test beer',
  breweries: ['1b2c3d4e-5f60-4718-9829-3a4b5c6d7e8f'],
  styles: ['2c3d4e5f-6071-4829-a93a-4b5c6d7e8f90'],
}

interface HelperProps {
  onCreate: (beer: CreateBeerRequest) => void
  onCreated: (beer: BeerWithIds) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreCreate: UseCreateBeer = () => ({
    create: async (beer: CreateBeerRequest): Promise<unknown> => {
      props.onCreate(beer)
      return created
    },
    isLoading: false,
  })
  const validate: ValidateBeerWithIds = (result: unknown) => {
    props.onValidate(result)
    return validatedBeer
  }
  const { create, isLoading } = createBeer(useStoreCreate, validate).useCreate()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            props.onCreated(await create(request))
          })().catch(createErrorLogger('create failed', console.error))
        }}
      >
        Create
      </button>
    </div>
  )
}

test('create beer', async () => {
  const user = setupUser()
  const onCreate = vitest.fn()
  const onCreated = vitest.fn()
  const onValidate = vitest.fn()

  const { getByRole, getByText } = render(
    <Helper
      onCreate={onCreate}
      onCreated={onCreated}
      onValidate={onValidate}
    />,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    expect(onCreated).toHaveBeenCalledWith(validatedBeer)
  })
  expect(getByText('Not loading')).toBeDefined()
  expect(onCreate).toHaveBeenCalledWith(request)
  // The envelope is unwrapped before the validator sees the beer.
  expect(onValidate).toHaveBeenCalledWith(created.beer)
})
