import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { fireEvent } from '../../../fire-event'
import MaximumReviewCount from '../../../../src/components/internal/stats/MaximumReviewCount'

test('sets value', () => {
  const setValue = mockFunction<[maximumReviewCount: number]>()
  const { getByDisplayValue } = render(
    <MaximumReviewCount maxReviewCount={5} setMaxReviewCount={setValue} />,
  )
  const slider = getByDisplayValue(3)
  fireEvent.change(slider, { target: { value: '5' } })
  assertDeepEqual(setValue.mock.calls, [[13]])
})
