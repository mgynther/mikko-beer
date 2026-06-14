import { expect, test, vitest } from 'vitest'

import { createSetSearch } from './set-search'
import type { NavigationFunc } from '../components/util'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Button from '../components/common/Button'

interface HelperProps {
  navigate: NavigationFunc
}

function Helper(props: HelperProps): React.JSX.Element {
  const setSearch = createSetSearch('/', {
    useNavigate: () => props.navigate,
  }).stats
  function clickHandler(): void {
    void setSearch('annual', {
      property: 'value',
      'another-property': 'another-value',
    })
  }
  return (
    <div>
      <Button onClick={clickHandler} text='Testing' />
    </div>
  )
}

test('set search', async () => {
  const user = userEvent.setup()
  const navigate = vitest.fn()
  const { getByRole } = render(<Helper navigate={navigate} />)
  const button = getByRole('button', { name: 'Testing' })
  await user.click(button)
  expect(navigate).toHaveBeenCalledWith(
    '?stats=annual&property=value&another-property=another-value',
    { replace: true },
  )
})
