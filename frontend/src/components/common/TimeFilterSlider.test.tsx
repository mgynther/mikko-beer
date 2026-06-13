import { render, fireEvent } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import TimeFilterSlider from './TimeFilterSlider'

const dontCall = (): any => {
  throw new Error('must not be called')
}

test('renders contents', () => {
  const title = 'Time'
  const { getByDisplayValue, getByText } = render(
    <TimeFilterSlider
      title={title}
      time={{
        year: 2024,
        month: 12,
      }}
      minTime={{
        year: 2024,
        month: 11,
      }}
      maxTime={{
        year: 2025,
        month: 1,
      }}
      setTime={dontCall}
    />,
  )
  getByText(`${title}: 2024-12`)
  getByDisplayValue('1')
})

test('defaults to min time', () => {
  const title = 'Time'
  const { getByDisplayValue, getByText } = render(
    <TimeFilterSlider
      title={title}
      time={{
        year: 2024,
        month: 10,
      }}
      minTime={{
        year: 2024,
        month: 11,
      }}
      maxTime={{
        year: 2025,
        month: 1,
      }}
      setTime={dontCall}
    />,
  )
  getByText(`${title}: 2024-11`)
  getByDisplayValue('0')
})

test('throws on invalid range', () => {
  const title = 'Time'
  expect(() =>
    render(
      <TimeFilterSlider
        title={title}
        time={{
          year: 2024,
          month: 12,
        }}
        minTime={{
          year: 2025,
          month: 1,
        }}
        maxTime={{
          year: 2024,
          month: 11,
        }}
        setTime={dontCall}
      />,
    ),
  ).toThrow(`maxTime 2024-11 cannot be before minTime 2025-01`)
})

test('changes value', async () => {
  const setTime = vitest.fn()
  const { getByDisplayValue } = render(
    <TimeFilterSlider
      title={'title'}
      time={{
        year: 2024,
        month: 2,
      }}
      minTime={{
        year: 2024,
        month: 1,
      }}
      maxTime={{
        year: 2024,
        month: 3,
      }}
      setTime={setTime}
    />,
  )
  const slider = getByDisplayValue(1)
  fireEvent.change(slider, { target: { value: '2' } })
  expect(setTime.mock.calls).toEqual([[{ year: 2024, month: 3 }]])
})
