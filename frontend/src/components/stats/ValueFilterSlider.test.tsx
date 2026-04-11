import { render, fireEvent } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import ValueFilterSlider from './ValueFilterSlider'

test('sets value', () => {
  const setDisplayValue = vitest.fn()
  const setValue = vitest.fn()
  const { getByDisplayValue } = render(
    <ValueFilterSlider
      title={'Title'}
      value={5}
      values={[5, 21, 194]}
      setDisplayValue={setDisplayValue}
      setValue={setValue}
    />
  )
  const slider = getByDisplayValue(0)
  fireEvent.change(slider, {target: {value: '2'}})
  expect(setDisplayValue.mock.calls).toEqual([[194]])
  expect(setValue.mock.calls).toEqual([[194]])
})

test('sets value on mobile', () => {
  const setDisplayValue = vitest.fn()
  const setValue = vitest.fn()
  const { getByDisplayValue } = render(
    <ValueFilterSlider
      title={'Title'}
      value={5}
      values={[5, 21, 194]}
      setDisplayValue={setDisplayValue}
      setValue={setValue}
    />
  )
  const slider = getByDisplayValue(0)
  fireEvent.touchStart(slider)
  fireEvent.change(slider, {target: {value: '1'}})
  fireEvent.change(slider, {target: {value: '2'}})
  fireEvent.touchEnd(slider)
  expect(setDisplayValue.mock.calls).toEqual([[21], [194]])
  expect(setValue.mock.calls).toEqual([[194]])
})

test('defaults to first value on invalid', () => {
  const { getByDisplayValue } = render(
    <ValueFilterSlider
      title={'Title'}
      value={1}
      values={[5, 21, 194]}
      setDisplayValue={vitest.fn()}
      setValue={vitest.fn()}
    />
  )
  getByDisplayValue(0)
})
