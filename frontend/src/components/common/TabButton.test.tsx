import { render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import TabButton from './TabButton'

test('clicks button', () => {
  const title = 'This is title'
  const onClick = vitest.fn()
  const { getByRole } = render(
    <TabButton
      isCompact={false}
      isSelected={false}
      onClick={onClick}
      title={title}
    />
  )
  const saveButton = getByRole('button', { name: title })
  saveButton.click()
  expect(onClick).toHaveBeenCalled()
})
