import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'

import Button from './Button'

test('handles click', async () => {
  const user = userEvent.setup()
  const clickCb = vitest.fn()
  const { getByRole } = render(
    <Button
      disabled={false}
      onClick={clickCb}
      text='Click me'
    />
  )
  const button = getByRole('button', { name: 'Click me' })
  await user.click(button)
  expect(clickCb).toHaveBeenCalled()
})

test('does not handle click when disabled', async () => {
  const user = userEvent.setup()
  const clickCb = vitest.fn()
  const { getByRole } = render(
    <Button
      disabled={true}
      onClick={clickCb}
      text='Click me'
    />
  )
  const button = getByRole('button', { name: 'Click me' })
  await user.click(button)
  expect(clickCb).not.toHaveBeenCalled()
  expect(button.hasAttribute('disabled')).toEqual(true)
})
