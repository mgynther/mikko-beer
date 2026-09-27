import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { fireEvent } from '../../../fire-event'
import Slider from '../../../../src/components/internal/common/Slider'
import { dontCall } from '../../../dont-call'

test('renders value', () => {
  const { getByDisplayValue } = render(
    <Slider
      id='slider'
      className={undefined}
      value={5}
      min={4}
      max={10}
      step={1}
      setDisplayValue={dontCall}
      setValue={dontCall}
    />,
  )
  getByDisplayValue('5')
})

test('changes value', async () => {
  const setDisplayValue = mockFunction<[value: number]>()
  const setValue = mockFunction<[value: number]>()
  const { getByDisplayValue } = render(
    <Slider
      id='slider'
      className={undefined}
      value={5}
      min={4}
      max={10}
      step={1}
      setDisplayValue={setDisplayValue}
      setValue={setValue}
    />,
  )
  const slider = getByDisplayValue(5)
  fireEvent.change(slider, { target: { value: '7' } })
  assertDeepEqual(setDisplayValue.mock.calls, [[7]])
  assertDeepEqual(setValue.mock.calls, [[7]])
})

test('changes value on mouse', async () => {
  const setDisplayValue = mockFunction<[value: number]>()
  const setValue = mockFunction<[value: number]>()
  const { getByDisplayValue } = render(
    <Slider
      id='slider'
      className={undefined}
      value={5}
      min={4}
      max={10}
      step={1}
      setDisplayValue={setDisplayValue}
      setValue={setValue}
    />,
  )
  const slider = getByDisplayValue(5)
  fireEvent.mouseDown(slider)
  fireEvent.change(slider, { target: { value: '7' } })
  fireEvent.change(slider, { target: { value: '8' } })
  fireEvent.mouseUp(slider)
  assertDeepEqual(setDisplayValue.mock.calls, [[7], [8]])
  assertDeepEqual(setValue.mock.calls, [[8]])
})

test('changes value on mobile', async () => {
  const setDisplayValue = mockFunction<[value: number]>()
  const setValue = mockFunction<[value: number]>()
  const { getByDisplayValue } = render(
    <Slider
      id='slider'
      className={undefined}
      value={5}
      min={4}
      max={10}
      step={1}
      setDisplayValue={setDisplayValue}
      setValue={setValue}
    />,
  )
  const slider = getByDisplayValue(5)
  fireEvent.touchStart(slider)
  fireEvent.change(slider, { target: { value: '7' } })
  fireEvent.change(slider, { target: { value: '8' } })
  fireEvent.touchEnd(slider)
  assertDeepEqual(setDisplayValue.mock.calls, [[7], [8]])
  assertDeepEqual(setValue.mock.calls, [[8]])
})
