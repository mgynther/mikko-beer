import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { fireEvent } from '../../../fire-event'
import ValueFilterSlider from '../../../../src/components/internal/stats/ValueFilterSlider'

test('sets value', () => {
  const setDisplayValue = mockFunction()
  const setValue = mockFunction()
  const { getByDisplayValue } = render(
    <ValueFilterSlider
      title={'Title'}
      value={5}
      values={[5, 21, 194]}
      setDisplayValue={setDisplayValue}
      setValue={setValue}
    />,
  )
  const slider = getByDisplayValue(0)
  fireEvent.change(slider, { target: { value: '2' } })
  assertDeepEqual(setDisplayValue.mock.calls, [[194]])
  assertDeepEqual(setValue.mock.calls, [[194]])
})

test('sets value on mobile', () => {
  const setDisplayValue = mockFunction()
  const setValue = mockFunction()
  const { getByDisplayValue } = render(
    <ValueFilterSlider
      title={'Title'}
      value={5}
      values={[5, 21, 194]}
      setDisplayValue={setDisplayValue}
      setValue={setValue}
    />,
  )
  const slider = getByDisplayValue(0)
  fireEvent.touchStart(slider)
  fireEvent.change(slider, { target: { value: '1' } })
  fireEvent.change(slider, { target: { value: '2' } })
  fireEvent.touchEnd(slider)
  assertDeepEqual(setDisplayValue.mock.calls, [[21], [194]])
  assertDeepEqual(setValue.mock.calls, [[194]])
})

test('defaults to first value on invalid', () => {
  const { getByDisplayValue } = render(
    <ValueFilterSlider
      title={'Title'}
      value={1}
      values={[5, 21, 194]}
      setDisplayValue={mockFunction()}
      setValue={mockFunction()}
    />,
  )
  getByDisplayValue(0)
})
