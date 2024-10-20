import { render, fireEvent } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import MinimumReviewCount from './MinimumReviewCount'

test('sets value', () => {
  const setValue = vitest.fn()
  const { getByDisplayValue } = render(
    <MinimumReviewCount
      minReviewCount={5}
      setMinReviewCount={setValue}
    />
  )
  const slider = getByDisplayValue(3)
  fireEvent.change(slider, {target: {value: '8'}})
  expect(setValue.mock.calls).toEqual([[55]])
})
