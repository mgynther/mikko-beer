import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import getBeer from './get'
import type { Beer, UseGetBeer, ValidateBeerOrUndefined } from './types'

// Both the store function and the validator are stubs. What the request looks
// like is proven in the store layer and what a valid beer looks like in
// the validation layer; what is proven here is that the response reaches the
// validator through the envelope and that the validator's result reaches the
// interface.
const validatedBeer: Beer = {
  id: '2b3c4d5e-6f70-4819-a2b3-c4d5e6f70819',
  name: 'Validated beer',
  breweries: [],
  styles: [],
}

const beerId = 'ef20147e-c396-48c6-a314-ceef15a42ca5'

interface HelperProps {
  data: unknown
  isLoading: boolean
  onGet: (beerId: string) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreGet: UseGetBeer = (id: string) => {
    props.onGet(id)
    return { data: props.data, isLoading: props.isLoading }
  }
  const validate: ValidateBeerOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return result === undefined ? undefined : validatedBeer
  }
  const { beer, isLoading } = getBeer(useStoreGet, validate).useGetBeer(beerId)
  return (
    <div>
      <div>{beer === undefined ? 'No beer' : beer.name}</div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
    </div>
  )
}

test('get beer', () => {
  const onGet = vitest.fn()
  const onValidate = vitest.fn()
  const data = { beer: { id: beerId, name: 'Test beer' } }

  const { getByText } = render(
    <Helper
      data={data}
      isLoading={false}
      onGet={onGet}
      onValidate={onValidate}
    />,
  )

  expect(getByText(validatedBeer.name)).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onGet).toHaveBeenCalledWith(beerId)
  // The envelope is unwrapped here, so the validator judges the beer and
  // not the wrapper it arrived in.
  expect(onValidate).toHaveBeenCalledWith(data.beer)
})

test('get beer that has not arrived', () => {
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper
      data={undefined}
      isLoading={true}
      onGet={() => undefined}
      onValidate={onValidate}
    />,
  )

  expect(getByText('No beer')).toBeDefined()
  expect(getByText('Loading')).toBeDefined()
  expect(onValidate).toHaveBeenCalledWith(undefined)
})
