import { render } from '@testing-library/react'
import { setupUser } from '../../../test-util/user-event'
import { expect, test, vitest } from 'vitest'

import Button from './Button'

test('handles click', async () => {
  const user = setupUser()
  const clickCb = vitest.fn()
  const { getByRole } = render(
    <Button disabled={false} onClick={clickCb} text='Click me' />,
  )
  const button = getByRole('button', { name: 'Click me' })
  await user.click(button)
  expect(clickCb).toHaveBeenCalled()
})

test('does not handle click when disabled', async () => {
  const user = setupUser()
  const clickCb = vitest.fn()
  const { getByRole } = render(
    <Button disabled={true} onClick={clickCb} text='Click me' />,
  )
  const button = getByRole('button', { name: 'Click me' })
  await user.click(button)
  expect(clickCb).not.toHaveBeenCalled()
  expect(button.hasAttribute('disabled')).toEqual(true)
})

test('does not enable button when onClick is missing', async () => {
  const { getByRole } = render(
    <Button disabled={false} onClick={undefined} text='Click me' />,
  )
  const button = getByRole('button', { name: 'Click me' })
  expect(button.hasAttribute('disabled')).toEqual(true)
})
