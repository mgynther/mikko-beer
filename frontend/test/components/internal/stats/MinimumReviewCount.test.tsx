import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { fireEvent } from '../../../fire-event'
import MinimumReviewCount from '../../../../src/components/internal/stats/MinimumReviewCount'

test('sets value', () => {
  const setValue = mockFunction()
  const { getByDisplayValue } = render(
    <MinimumReviewCount minReviewCount={5} setMinReviewCount={setValue} />,
  )
  const slider = getByDisplayValue(3)
  fireEvent.change(slider, { target: { value: '8' } })
  assertDeepEqual(setValue.mock.calls, [[55]])
})
