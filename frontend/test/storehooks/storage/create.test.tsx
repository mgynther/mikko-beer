import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import createStorage from '../../../src/storehooks/storage/create'
import type {
  CreatedStorage,
  CreateStorageRequest,
  UseCreateStorage,
  ValidateCreatedStorage,
} from '../../../src/storehooks/storage/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildCreatedStorage } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedCreatedStorage = buildCreatedStorage()

const created = { storage: { id: 'created', beer: 'beer' } }

const request: CreateStorageRequest = {
  beer: 'c3d4e5f6-0718-4293-a4b5-c6d7e8f90112',
  bestBefore: '2026-01-01T00:00:00.000Z',
  container: 'd4e5f607-1829-43a4-b5c6-d7e8f9011223',
}

interface HelperProps {
  hasError: boolean
  onCreate: (request: CreateStorageRequest) => void
  onCreated: (storage: CreatedStorage) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreCreate: UseCreateStorage = () => ({
    create: async (storage: CreateStorageRequest): Promise<unknown> => {
      props.onCreate(storage)
      return created
    },
    hasError: props.hasError,
    isLoading: false,
  })
  const validate: ValidateCreatedStorage = (result: unknown) => {
    props.onValidate(result)
    return validatedCreatedStorage
  }
  const { create, hasError, isLoading } = createStorage(
    useStoreCreate,
    validate,
  ).useCreate()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{hasError ? 'Failed' : 'Not failed'}</div>
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

test('create storage', async () => {
  const user = setupUser()
  const onCreate = mockFunction()
  const onCreated = mockFunction()
  const onValidate = mockFunction()

  const { getByRole, getByText } = render(
    <Helper
      hasError={false}
      onCreate={onCreate}
      onCreated={onCreated}
      onValidate={onValidate}
    />,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    assertCalledWith(onCreated, [validatedCreatedStorage])
  })
  assertDefined(getByText('Not failed'))
  assertDefined(getByText('Not loading'))
  assertCalledWith(onCreate, [request])
  // The envelope is unwrapped before the validator sees the storage.
  assertCalledWith(onValidate, [created.storage])
})

test('a failed creation is reported rather than validated', () => {
  const { getByText } = render(
    <Helper
      hasError={true}
      onCreate={() => undefined}
      onCreated={() => undefined}
      onValidate={() => undefined}
    />,
  )

  assertDefined(getByText('Failed'))
})
