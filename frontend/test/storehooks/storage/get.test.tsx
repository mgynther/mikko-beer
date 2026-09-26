import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import getStorage from '../../../src/storehooks/storage/get'
import type {
  UseGetStorage,
  ValidateStorageOrUndefined,
} from '../../../src/storehooks/storage/types'
import { buildStorage } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedStorage = buildStorage({ beerName: 'Validated beer' })

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
