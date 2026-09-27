import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'

import getLocation from '../../../src/storehooks/location/get'
import type {
  UseGetLocation,
  ValidateLocationOrUndefined,
} from '../../../src/storehooks/location/types'
import { buildLocation } from './builders'

// Both the store function and the validator are stubs. What the request looks
// like is proven in the store layer and what a valid location looks like in
// the validation layer; what is proven here is that the response reaches the
// validator through the envelope and that the validator's result reaches the
// interface.
const validatedLocation = buildLocation({ name: 'Validated location' })

const locationId = '38ba5e94-5807-4fe5-ba85-f2580895a4fc'

interface HelperProps {
  data: unknown
  isLoading: boolean
  onGet: (locationId: string) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreGet: UseGetLocation = (id: string) => {
    props.onGet(id)
    return { data: props.data, isLoading: props.isLoading }
  }
  const validate: ValidateLocationOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return result === undefined ? undefined : validatedLocation
  }
  const { location, isLoading } = getLocation(useStoreGet, validate).useGet(
    locationId,
  )
  return (
    <div>
      <div>{location === undefined ? 'No location' : location.name}</div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
    </div>
  )
}

test('get location', () => {
  const onGet = mockFunction()
  const onValidate = mockFunction()
  const data = { location: { id: locationId, name: 'Test location' } }

  const { getByText } = render(
    <Helper
      data={data}
      isLoading={false}
      onGet={onGet}
      onValidate={onValidate}
    />,
  )

  assertDefined(getByText(validatedLocation.name))
  assertDefined(getByText('Not loading'))
  assertCalledWith(onGet, [locationId])
  // The envelope is unwrapped here, so the validator judges the location and
  // not the wrapper it arrived in.
  assertCalledWith(onValidate, [data.location])
})

test('get location that has not arrived', () => {
  const onValidate = mockFunction()

  const { getByText } = render(
    <Helper
      data={undefined}
      isLoading={true}
      onGet={() => undefined}
      onValidate={onValidate}
    />,
  )

  assertDefined(getByText('No location'))
  assertDefined(getByText('Loading'))
  assertCalledWith(onValidate, [undefined])
})
