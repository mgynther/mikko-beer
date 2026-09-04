import { render } from '@testing-library/react'
import { setupUser } from '../../../test-util/user-event'
import { expect, test, vitest } from 'vitest'

import LinkLikeButton from './LinkLikeButton'

test('handles click', async () => {
  const user = setupUser()
  const click = vitest.fn()
  const { getByRole } = render(
    <LinkLikeButton onClick={click} text='Button text' />,
  )
  const button = getByRole('button', { name: 'Button text' })
  await user.click(button)
  expect(click.mock.calls).toEqual([[]])
})
