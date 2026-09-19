import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import getStorage from './get'
import type {
  Storage,
  UseGetStorage,
  ValidateStorageOrUndefined,
} from './types'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedStorage: Storage = {
  id: 'e5f60718-293a-44b5-8c6d-7e8f90112233',
  beerId: 'f6071829-3a4b-45c6-9d7e-8f9011223344',
  beerName: 'Validated beer',
  bestBefore: '2026-01-01T00:00:00.000Z',
  breweries: [],
  container: {
    id: '07182930-4b5c-46d7-9e8f-901122334455',
    type: 'bottle',
    size: '0.33',
  },
  createdAt: '2025-01-01T00:00:00.000Z',
  hasReview: false,
  styles: [],
}

const storageId = '9b2ae1cd-5d2f-4a6a-b1d0-2f9b0e2c9e9c'

interface HelperProps {
  data: unknown
  isLoading: boolean
  onGet: (storageId: string) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreGet: UseGetStorage = (id: string) => {
    props.onGet(id)
    return { data: props.data, isLoading: props.isLoading }
  }
  const validate: ValidateStorageOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return result === undefined ? undefined : validatedStorage
  }
  const { storage, isLoading } = getStorage(useStoreGet, validate).useGet(
    storageId,
  )
  return (
    <div>
      <div>{storage === undefined ? 'No storage' : storage.beerName}</div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
    </div>
  )
}

test('get storage', () => {
  const onGet = vitest.fn()
  const onValidate = vitest.fn()
  const data = { storage: { id: storageId, beerName: 'Test beer' } }

  const { getByText } = render(
    <Helper
      data={data}
      isLoading={false}
      onGet={onGet}
      onValidate={onValidate}
    />,
  )

  expect(getByText(validatedStorage.beerName)).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onGet).toHaveBeenCalledWith(storageId)
  // The envelope is unwrapped before the validator sees the storage.
  expect(onValidate).toHaveBeenCalledWith(data.storage)
})

test('get storage that has not arrived', () => {
  const { getByText } = render(
    <Helper
      data={undefined}
      isLoading={true}
      onGet={() => undefined}
      onValidate={() => undefined}
    />,
  )

  expect(getByText('No storage')).toBeDefined()
  expect(getByText('Loading')).toBeDefined()
})
