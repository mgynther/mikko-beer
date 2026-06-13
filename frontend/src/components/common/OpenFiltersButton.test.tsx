import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import OpenFiltersButton from './OpenFiltersButton'
import { openFilters } from '../common/filters-test-util'

test('opens filters', async () => {
  const user = userEvent.setup()
  const setIsOpen = vitest.fn()
  const { getByRole } = render(
    <OpenFiltersButton isOpen={false} setIsOpen={setIsOpen} />,
  )
  await openFilters(getByRole, user)
  expect(setIsOpen.mock.calls).toEqual([[true]])
})

test('closes filters', async () => {
  const user = userEvent.setup()
  const setIsOpen = vitest.fn()
  const { getByRole } = render(
    <OpenFiltersButton isOpen={true} setIsOpen={setIsOpen} />,
  )
  const toggleButton = getByRole('button', { name: 'Filters ▲' })
  await user.click(toggleButton)
  expect(setIsOpen.mock.calls).toEqual([[false]])
})
