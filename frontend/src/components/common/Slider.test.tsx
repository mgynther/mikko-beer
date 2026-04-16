import { render, fireEvent } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import Slider from './Slider'

const dontCall = (): any => {
  throw new Error('must not be called')
}

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
  const setDisplayValue = vitest.fn()
  const setValue = vitest.fn()
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
  expect(setDisplayValue.mock.calls).toEqual([[7]])
  expect(setValue.mock.calls).toEqual([[7]])
})

test('changes value on mouse', async () => {
  const setDisplayValue = vitest.fn()
  const setValue = vitest.fn()
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
  expect(setDisplayValue.mock.calls).toEqual([[7], [8]])
  expect(setValue.mock.calls).toEqual([[8]])
})

test('changes value on mobile', async () => {
  const setDisplayValue = vitest.fn()
  const setValue = vitest.fn()
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
  expect(setDisplayValue.mock.calls).toEqual([[7], [8]])
  expect(setValue.mock.calls).toEqual([[8]])
})
