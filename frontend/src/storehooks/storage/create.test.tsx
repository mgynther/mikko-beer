import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import createStorage from './create'
import type {
  CreatedStorage,
  CreateStorageRequest,
  UseCreateStorage,
  ValidateCreatedStorage,
} from './types'
import { setupUser } from '../../../test-util/user-event'
import { createErrorLogger } from '../../../test-util/error-logger'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedCreatedStorage: CreatedStorage = {
  id: '90112233-4455-4667-8899-aabbccddeeff',
  beer: 'a1b2c3d4-e5f6-4071-8293-a4b5c6d7e8f9',
  bestBefore: '2026-01-01T00:00:00.000Z',
  container: 'b2c3d4e5-f607-4182-93a4-b5c6d7e8f901',
}

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
  const onCreate = vitest.fn()
  const onCreated = vitest.fn()
  const onValidate = vitest.fn()

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
    expect(onCreated).toHaveBeenCalledWith(validatedCreatedStorage)
  })
  expect(getByText('Not failed')).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onCreate).toHaveBeenCalledWith(request)
  // The envelope is unwrapped before the validator sees the storage.
  expect(onValidate).toHaveBeenCalledWith(created.storage)
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

  expect(getByText('Failed')).toBeDefined()
})
