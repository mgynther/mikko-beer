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
      isUpperCase={true}
      onClick={onClick}
      title={title}
    />,
  )
  const saveButton = getByRole('button', { name: title })
  saveButton.click()
  expect(onClick).toHaveBeenCalled()
})

test('renders compact selected non-uppercase', () => {
  const title = 'This is title'
  const { getByText } = render(
    <TabButton
      isCompact={true}
      isSelected={true}
      isUpperCase={false}
      onClick={vitest.fn()}
      title={title}
    />,
  )
  getByText(title)
})
