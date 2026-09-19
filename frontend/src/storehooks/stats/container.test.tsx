import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import statsHook from './stats'
import type { IdParams, ContainerStats } from './types'
import { statsStore } from '../../../test-util/stats-store'
import { statsValidators } from '../../../test-util/stats-validators'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx. The store functions a test does not drive
// are dontCall, so wiring the wrong one fails loudly.
const validatedStats: ContainerStats = {
  container: [],
}

const data = { container: [{ id: 'one' }] }

const params: IdParams = {
  breweryId: undefined,
  locationId: undefined,
  styleId: undefined,
}

interface HelperProps {
  onQuery: (params: IdParams) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const store = statsStore({
    container: (idParams: IdParams) => {
      props.onQuery(idParams)
      return { data, isLoading: false }
    },
  })
  const validators = statsValidators({
    containerOrUndefined: (result: unknown) => {
      props.onValidate(result)
      return validatedStats
    },
  })
  const { stats, isLoading } = statsHook(store, validators).container.useStats(
    params,
  )
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{stats === undefined ? 'No stats' : 'Validated stats'}</div>
    </div>
  )
}

test('container stats', () => {
  const onQuery = vitest.fn()
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper onQuery={onQuery} onValidate={onValidate} />,
  )

  expect(getByText('Validated stats')).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onQuery).toHaveBeenCalledWith(params)
  // These statistics are not wrapped in an envelope, so the validator is
  // given the response as it arrived.
  expect(onValidate).toHaveBeenCalledWith(data)
})
