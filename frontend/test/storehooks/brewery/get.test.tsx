import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'

import getBrewery from '../../../src/storehooks/brewery/get'
import type {
  UseGetBrewery,
  ValidateBreweryOrUndefined,
} from '../../../src/storehooks/brewery/types'
import { buildBrewery } from './builders'

// Both the store function and the validator are stubs. What the request looks
// like is proven in the store layer and what a valid brewery looks like in
// the validation layer; what is proven here is that the response reaches the
// validator through the envelope and that the validator's result reaches the
// interface.
const validatedBrewery = buildBrewery({ name: 'Validated brewery' })

const breweryId = 'ef20147e-c396-48c6-a314-ceef15a42ca5'

interface HelperProps {
  data: unknown
  isLoading: boolean
  onGet: (breweryId: string) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreGet: UseGetBrewery = (id: string) => {
    props.onGet(id)
    return { data: props.data, isLoading: props.isLoading }
  }
  const validate: ValidateBreweryOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return result === undefined ? undefined : validatedBrewery
  }
  const { brewery, isLoading } = getBrewery(useStoreGet, validate).useGet(
    breweryId,
  )
  return (
    <div>
      <div>{brewery === undefined ? 'No brewery' : brewery.name}</div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
    </div>
  )
}

test('get brewery', () => {
  const onGet = mockFunction<[breweryId: string]>()
  const onValidate = mockFunction<[result: unknown]>()
  const data = { brewery: { id: breweryId, name: 'Test brewery' } }

  const { getByText } = render(
    <Helper
      data={data}
      isLoading={false}
      onGet={onGet}
      onValidate={onValidate}
    />,
  )

  assertDefined(getByText(validatedBrewery.name))
  assertDefined(getByText('Not loading'))
  assertCalledWith(onGet, [breweryId])
  // The envelope is unwrapped here, so the validator judges the brewery and
  // not the wrapper it arrived in.
  assertCalledWith(onValidate, [data.brewery])
})

test('get brewery that has not arrived', () => {
  const onValidate = mockFunction<[result: unknown]>()

  const { getByText } = render(
    <Helper
      data={undefined}
      isLoading={true}
      onGet={() => undefined}
      onValidate={onValidate}
    />,
  )

  assertDefined(getByText('No brewery'))
  assertDefined(getByText('Loading'))
  assertCalledWith(onValidate, [undefined])
})
