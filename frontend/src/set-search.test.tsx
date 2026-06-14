import { expect, test, vitest } from 'vitest'

import { createSetSearch } from './set-search'
import type { NavigationFunc } from './navigation'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Button from './components/common/Button'

interface HelperProps {
  navigate: NavigationFunc
  pathname: string
}

function Helper(props: HelperProps): React.JSX.Element {
  const setSearch = createSetSearch(props.pathname, {
    useNavigate: () => props.navigate,
  })
  function reviewListClickHandler(): void {
    void setSearch.reviewList({
      'review-list-property': 'value',
      'another-review-list-property': 'another-value',
    })
  }
  function statsClickHandler(): void {
    void setSearch.stats('annual', {
      'stats-property': 'value',
      'another-stats-property': 'another-value',
    })
  }
  return (
    <div>
      <Button onClick={reviewListClickHandler} text='Test review list' />
      <Button onClick={statsClickHandler} text='Test stats' />
    </div>
  )
}

const reviewListSearch =
  'review-list-property=value&another-review-list-property=another-value'
const statsSearch =
  'stats=annual&stats-property=value&another-stats-property=another-value'

test('set review list search', async () => {
  const user = userEvent.setup()
  const navigate = vitest.fn()
  const { getByRole } = render(<Helper navigate={navigate} pathname='/' />)
  const button = getByRole('button', { name: 'Test review list' })
  await user.click(button)
  expect(navigate).toHaveBeenCalledWith(`?${reviewListSearch}`, {
    replace: true,
  })
})

test('set stats search', async () => {
  const user = userEvent.setup()
  const navigate = vitest.fn()
  const { getByRole } = render(<Helper navigate={navigate} pathname='/' />)
  const button = getByRole('button', { name: 'Test stats' })
  await user.click(button)
  expect(navigate).toHaveBeenCalledWith(`?${statsSearch}`, { replace: true })
})

test('set review list and stats search', async () => {
  const user = userEvent.setup()
  const navigate = vitest.fn()
  const { getByRole } = render(<Helper navigate={navigate} pathname='/' />)

  const reviewListButton = getByRole('button', { name: 'Test review list' })
  await user.click(reviewListButton)

  const statsButton = getByRole('button', { name: 'Test stats' })
  await user.click(statsButton)
  expect(navigate).toHaveBeenCalledWith(`?${statsSearch}&${reviewListSearch}`, {
    replace: true,
  })
})

test('clear stored search on pathname change', async () => {
  const user = userEvent.setup()
  const navigate = vitest.fn()
  const { getByRole, rerender } = render(
    <Helper navigate={navigate} pathname='/' />,
  )

  const reviewListButton = getByRole('button', { name: 'Test review list' })
  await user.click(reviewListButton)

  rerender(<Helper navigate={navigate} pathname='/reviews' />)

  const statsButton = getByRole('button', { name: 'Test stats' })
  await user.click(statsButton)
  expect(navigate).toHaveBeenCalledWith(`?${statsSearch}`, { replace: true })
})
