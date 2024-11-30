import { render, fireEvent } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import Slider from './Slider'

const dontCall = (): any => {
  throw new Error('must not be called')
}

test('renders value', () => {
  const { getByDisplayValue } = render(
    <Slider
      className={undefined}
      value={5}
      min={4}
      max={10}
      step={1}
      setValue={dontCall}
    />
  )
  getByDisplayValue('5')
})

test('changes value', async () => {
  const setValue = vitest.fn()
  const { getByDisplayValue } = render(
    <Slider
      className={undefined}
      value={5}
      min={4}
      max={10}
      step={1}
      setValue={setValue}
    />
  )
  const slider = getByDisplayValue(5)
  fireEvent.change(slider, {target: {value: '7'}})
  expect(setValue.mock.calls).toEqual([[7]])
})
