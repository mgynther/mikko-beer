import { test } from '../../../test'
import { assertDeepEqual, assertDefined } from '../../../assert'
import { render } from '../../../render'
import Flag from '../../../../src/components/internal/common/Flag'

test('renders Finnish flag', () => {
  const { getByText } = render(<Flag country='FI' />)
  assertDefined(getByText('\u{1F1EB}\u{1F1EE}'))
})

test('renders Estonian flag', () => {
  const { getByText } = render(<Flag country='EE' />)
  assertDefined(getByText('\u{1F1EA}\u{1F1EA}'))
})

test('renders British flag', () => {
  const { getByText } = render(<Flag country='GB' />)
  assertDefined(getByText('\u{1F1EC}\u{1F1E7}'))
})

test('renders Swedish flag', () => {
  const { getByText } = render(<Flag country='SE' />)
  assertDefined(getByText('\u{1F1F8}\u{1F1EA}'))
})

test('renders Belgian flag', () => {
  const { getByText } = render(<Flag country='BE' />)
  assertDefined(getByText('\u{1F1E7}\u{1F1EA}'))
})

test('renders nothing for lower case country code', () => {
  const { container } = render(<Flag country='fi' />)
  assertDeepEqual(container.firstChild, null)
})

test('renders nothing without country', () => {
  const { container } = render(<Flag country={undefined} />)
  assertDeepEqual(container.firstChild, null)
})

test('renders nothing for too short country', () => {
  const { container } = render(<Flag country='F' />)
  assertDeepEqual(container.firstChild, null)
})

test('renders nothing for too long country', () => {
  const { container } = render(<Flag country='FIN' />)
  assertDeepEqual(container.firstChild, null)
})

test('renders nothing for invalid country', () => {
  const { container } = render(<Flag country='12' />)
  assertDeepEqual(container.firstChild, null)
})
