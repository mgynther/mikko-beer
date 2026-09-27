import { test } from '../../../test'
import { assertCallCount, assertCalled, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'

import Button from '../../../../src/components/internal/common/Button'

test('handles click', async () => {
  const user = setupUser()
  const clickCb = mockFunction<[]>()
  const { getByRole } = render(
    <Button disabled={false} onClick={clickCb} text='Click me' />,
  )
  const button = getByRole('button', { name: 'Click me' })
  await user.click(button)
  assertCalled(clickCb)
})

test('does not handle click when disabled', async () => {
  const user = setupUser()
  const clickCb = mockFunction<[]>()
  const { getByRole } = render(
    <Button disabled={true} onClick={clickCb} text='Click me' />,
  )
  const button = getByRole('button', { name: 'Click me' })
  await user.click(button)
  assertCallCount(clickCb, 0)
  assertEqual(button.hasAttribute('disabled'), true)
})

test('does not enable button when onClick is missing', async () => {
  const { getByRole } = render(
    <Button disabled={false} onClick={undefined} text='Click me' />,
  )
  const button = getByRole('button', { name: 'Click me' })
  assertEqual(button.hasAttribute('disabled'), true)
})
