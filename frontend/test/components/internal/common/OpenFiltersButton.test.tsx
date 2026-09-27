import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import OpenFiltersButton from '../../../../src/components/internal/common/OpenFiltersButton'
import { openFilters } from '../../open-filters'

test('opens filters', async () => {
  const user = setupUser()
  const setIsOpen = mockFunction<[isOpen: boolean]>()
  const { getByRole } = render(
    <OpenFiltersButton isOpen={false} setIsOpen={setIsOpen} />,
  )
  await openFilters(getByRole, user)
  assertDeepEqual(setIsOpen.mock.calls, [[true]])
})

test('closes filters', async () => {
  const user = setupUser()
  const setIsOpen = mockFunction<[isOpen: boolean]>()
  const { getByRole } = render(
    <OpenFiltersButton isOpen={true} setIsOpen={setIsOpen} />,
  )
  const toggleButton = getByRole('button', { name: 'Filters ▲' })
  await user.click(toggleButton)
  assertDeepEqual(setIsOpen.mock.calls, [[false]])
})
