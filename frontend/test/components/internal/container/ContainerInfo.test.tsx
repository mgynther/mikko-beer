import { test } from '../../../test'
import { assertEqual } from '../../../assert'
import { render } from '../../../render'
import ContainerInfo, {
  asText,
} from '../../../../src/components/internal/container/ContainerInfo'
import type { Container } from '../../../../src/components/types/container/types'

const container: Container = {
  id: '70bdc1c5-861f-4f65-afb8-c598f01e83d6',
  type: 'bottle',
  size: '0.25',
}

test('container info as text', () => {
  assertEqual(asText(container), 'bottle 0.25')
})

test('renders container info', () => {
  const { getByText } = render(<ContainerInfo container={container} />)
  getByText('bottle 0.25')
})
