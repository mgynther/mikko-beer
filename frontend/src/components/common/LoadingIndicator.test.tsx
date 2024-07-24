import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import LoadingIndicator, { loadingIndicatorText } from './LoadingIndicator'

test('renders loading text', () => {
  const { getByText } = render(
    <LoadingIndicator isLoading={true} />
  )
  const text = getByText(loadingIndicatorText)
  expect(text).toBeDefined()
})

test('does not render text when not loading', () => {
  const { queryByText } = render(
    <LoadingIndicator isLoading={false} />
  )
  const result = queryByText(loadingIndicatorText)
  expect(result).toEqual(null)
})
