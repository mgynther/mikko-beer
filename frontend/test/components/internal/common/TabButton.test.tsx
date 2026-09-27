import { test } from '../../../test'
import { assertCalled } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import TabButton from '../../../../src/components/internal/common/TabButton'

test('clicks button', () => {
  const title = 'This is title'
  const onClick = mockFunction()
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
  assertCalled(onClick)
})

test('renders compact selected non-uppercase', () => {
  const title = 'This is title'
  const { getByText } = render(
    <TabButton
      isCompact={true}
      isSelected={true}
      isUpperCase={false}
      onClick={mockFunction()}
      title={title}
    />,
  )
  getByText(title)
})
