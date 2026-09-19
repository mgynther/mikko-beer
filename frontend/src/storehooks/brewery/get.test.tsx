import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import getBrewery from './get'
import type {
  Brewery,
  UseGetBrewery,
  ValidateBreweryOrUndefined,
} from './types'

// Both the store function and the validator are stubs. What the request looks
// like is proven in the store layer and what a valid brewery looks like in
// the validation layer; what is proven here is that the response reaches the
// validator through the envelope and that the validator's result reaches the
// interface.
const validatedBrewery: Brewery = {
  id: '8a7b6c5d-4e3f-4210-9876-5a4b3c2d1e0f',
  name: 'Validated brewery',
  country: 'Finland',
}

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
  const onGet = vitest.fn()
  const onValidate = vitest.fn()
  const data = { brewery: { id: breweryId, name: 'Test brewery' } }

  const { getByText } = render(
    <Helper
      data={data}
      isLoading={false}
      onGet={onGet}
      onValidate={onValidate}
    />,
  )

  expect(getByText(validatedBrewery.name)).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onGet).toHaveBeenCalledWith(breweryId)
  // The envelope is unwrapped here, so the validator judges the brewery and
  // not the wrapper it arrived in.
  expect(onValidate).toHaveBeenCalledWith(data.brewery)
})

test('get brewery that has not arrived', () => {
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper
      data={undefined}
      isLoading={true}
      onGet={() => undefined}
      onValidate={onValidate}
    />,
  )

  expect(getByText('No brewery')).toBeDefined()
  expect(getByText('Loading')).toBeDefined()
  expect(onValidate).toHaveBeenCalledWith(undefined)
})
