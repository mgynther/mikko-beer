import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import createBrewery from '../../../src/storehooks/brewery/create'
import type {
  Brewery,
  CreateBreweryRequest,
  UseCreateBrewery,
  ValidateBrewery,
} from '../../../src/storehooks/brewery/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildBrewery } from './builders'

// Stubs for the store function and the validator, for the reason given in
// get.test.tsx.
const validatedBrewery = buildBrewery()

const created = { brewery: { id: 'created', name: 'Created brewery' } }

const request: CreateBreweryRequest = {
  name: 'Test brewery',
  country: 'Finland',
}

interface HelperProps {
  onCreate: (brewery: CreateBreweryRequest) => void
  onCreated: (brewery: Brewery) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreCreate: UseCreateBrewery = () => ({
    create: async (brewery: CreateBreweryRequest): Promise<unknown> => {
      props.onCreate(brewery)
      return created
    },
    isLoading: false,
  })
  const validate: ValidateBrewery = (result: unknown) => {
    props.onValidate(result)
    return validatedBrewery
  }
  const { create, isLoading } = createBrewery(
    useStoreCreate,
    validate,
  ).useCreate()
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

test('create brewery', async () => {
  const user = setupUser()
  const onCreate = mockFunction()
  const onCreated = mockFunction()
  const onValidate = mockFunction()

  const { getByRole, getByText } = render(
    <Helper
      onCreate={onCreate}
      onCreated={onCreated}
      onValidate={onValidate}
    />,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    assertCalledWith(onCreated, [validatedBrewery])
  })
  assertDefined(getByText('Not loading'))
  assertCalledWith(onCreate, [request])
  // The envelope is unwrapped before the validator sees the brewery.
  assertCalledWith(onValidate, [created.brewery])
})
