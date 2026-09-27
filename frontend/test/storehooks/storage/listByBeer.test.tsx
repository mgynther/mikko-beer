import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'

import listStoragesByBeer from '../../../src/storehooks/storage/listByBeer'
import type {
  StorageList,
  UseListStoragesBy,
  ValidateStorageListOrUndefined,
} from '../../../src/storehooks/storage/types'
import { buildStorage } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedStorageList: StorageList = {
  storages: [buildStorage({ beerName: 'Validated beer' })],
}

const listed = { storages: [{ id: 'listed', beerName: 'Listed beer' }] }

const beerId = 'a1b2c3d4-e5f6-4071-8293-a4b5c6d7e8f9'

interface HelperProps {
  onList: (id: string) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreList: UseListStoragesBy = (id: string) => {
    props.onList(id)
    return { data: listed, isLoading: false }
  }
  const validate: ValidateStorageListOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return validatedStorageList
  }
  const { storages, isLoading } = listStoragesByBeer(
    useStoreList,
    validate,
  ).useList(beerId)
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      {storages?.storages.map((storage) => (
        <div key={storage.id}>{storage.beerName}</div>
      ))}
    </div>
  )
}

test('list storages by beer', () => {
  const onList = mockFunction<[id: string]>()
  const onValidate = mockFunction<[result: unknown]>()

  const { getByText } = render(
    <Helper onList={onList} onValidate={onValidate} />,
  )

  assertDefined(getByText(validatedStorageList.storages[0].beerName))
  assertDefined(getByText('Not loading'))
  assertCalledWith(onList, [beerId])
  assertCalledWith(onValidate, [listed])
})
