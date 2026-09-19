import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import getLocation from './get'
import type {
  Location,
  UseGetLocation,
  ValidateLocationOrUndefined,
} from './types'

// Both the store function and the validator are stubs. What the request looks
// like is proven in the store layer and what a valid location looks like in
// the validation layer; what is proven here is that the response reaches the
// validator through the envelope and that the validator's result reaches the
// interface.
const validatedLocation: Location = {
  id: 'f1e2d3c4-b5a6-4978-8f0e-1d2c3b4a5968',
  name: 'Validated location',
}

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
  const onGet = vitest.fn()
  const onValidate = vitest.fn()
  const data = { location: { id: locationId, name: 'Test location' } }

  const { getByText } = render(
    <Helper
      data={data}
      isLoading={false}
      onGet={onGet}
      onValidate={onValidate}
    />,
  )

  expect(getByText(validatedLocation.name)).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onGet).toHaveBeenCalledWith(locationId)
  // The envelope is unwrapped here, so the validator judges the location and
  // not the wrapper it arrived in.
  expect(onValidate).toHaveBeenCalledWith(data.location)
})

test('get location that has not arrived', () => {
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper
      data={undefined}
      isLoading={true}
      onGet={() => undefined}
      onValidate={onValidate}
    />,
  )

  expect(getByText('No location')).toBeDefined()
  expect(getByText('Loading')).toBeDefined()
  expect(onValidate).toHaveBeenCalledWith(undefined)
})
