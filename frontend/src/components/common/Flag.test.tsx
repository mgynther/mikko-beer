import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import Flag from './Flag'

test('renders Finnish flag', () => {
  const { getByText } = render(<Flag country='FI' />)
  expect(getByText('\u{1F1EB}\u{1F1EE}')).toBeDefined()
})

test('renders Estonian flag', () => {
  const { getByText } = render(<Flag country='EE' />)
  expect(getByText('\u{1F1EA}\u{1F1EA}')).toBeDefined()
})

test('renders British flag', () => {
  const { getByText } = render(<Flag country='GB' />)
  expect(getByText('\u{1F1EC}\u{1F1E7}')).toBeDefined()
})

test('renders Swedish flag', () => {
  const { getByText } = render(<Flag country='SE' />)
  expect(getByText('\u{1F1F8}\u{1F1EA}')).toBeDefined()
})

test('renders Belgian flag', () => {
  const { getByText } = render(<Flag country='BE' />)
  expect(getByText('\u{1F1E7}\u{1F1EA}')).toBeDefined()
})

test('renders nothing without country', () => {
  const { container } = render(<Flag country={undefined} />)
  expect(container.firstChild).toEqual(null)
})

test('renders nothing for too short country', () => {
  const { container } = render(<Flag country='F' />)
  expect(container.firstChild).toEqual(null)
})

test('renders nothing for too long country', () => {
  const { container } = render(<Flag country='FIN' />)
  expect(container.firstChild).toEqual(null)
})
