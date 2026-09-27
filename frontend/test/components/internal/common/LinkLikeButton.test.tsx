import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'

import LinkLikeButton from '../../../../src/components/internal/common/LinkLikeButton'

test('handles click', async () => {
  const user = setupUser()
  const click = mockFunction<[]>()
  const { getByRole } = render(
    <LinkLikeButton onClick={click} text='Button text' />,
  )
  const button = getByRole('button', { name: 'Button text' })
  await user.click(button)
  assertDeepEqual(click.mock.calls, [[]])
})
