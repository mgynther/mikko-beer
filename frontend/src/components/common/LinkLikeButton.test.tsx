import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'

import LinkLikeButton from './LinkLikeButton'

test('handles click', async () => {
  const user = userEvent.setup()
  const click = vitest.fn()
  const { getByRole } = render(
    <LinkLikeButton
      onClick={click}
      text="Button text"
    />
  )
  const button = getByRole('button', { name: 'Button text' })
  await user.click(button)
  expect(click.mock.calls).toEqual([[]])
})
