import { render, fireEvent } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import StepFilterSlider from './StepFilterSlider'

const dontCall = () => {
  throw new Error('must not be called')
}

test('renders contents', () => {
  const title = 'This is title text'
  const { getByDisplayValue, getByText } = render(
    <StepFilterSlider
      title={title}
      value={5}
      min={4}
      max={10}
      step={1}
      setValue={dontCall}
    />
  )
  getByText(title)
  getByDisplayValue('5')
})

test('changes value', async () => {
  const setValue = vitest.fn()
  const { getByDisplayValue } = render(
    <StepFilterSlider
      title={'Title'}
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
