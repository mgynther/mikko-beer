import { render, fireEvent } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import MaximumReviewCount from './MaximumReviewCount'

test('sets value', () => {
  const setValue = vitest.fn()
  const { getByDisplayValue } = render(
    <MaximumReviewCount
      maxReviewCount={5}
      setMaxReviewCount={setValue}
    />
  )
  const slider = getByDisplayValue(3)
  fireEvent.change(slider, {target: {value: '5'}})
  expect(setValue.mock.calls).toEqual([[13]])
})
