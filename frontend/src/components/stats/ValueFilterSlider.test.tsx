import { render, fireEvent } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import ValueFilterSlider from './ValueFilterSlider'

test('sets value', () => {
  const setValue = vitest.fn()
  const { getByDisplayValue } = render(
    <ValueFilterSlider
      title={'Title'}
      value={5}
      values={[5, 21, 194]}
      setValue={setValue}
    />
  )
  const slider = getByDisplayValue(0)
  fireEvent.change(slider, {target: {value: '2'}})
  expect(setValue.mock.calls).toEqual([[194]])
})
