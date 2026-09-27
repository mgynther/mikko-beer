import { test } from '../../../test'
import { assertDeepEqual, assertThrowsWithMessage } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { fireEvent } from '../../../fire-event'
import TimeFilterSlider from '../../../../src/components/internal/common/TimeFilterSlider'
import { dontCall } from '../../../dont-call'

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
  assertThrowsWithMessage(
    () =>
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
    `maxTime 2024-11 cannot be before minTime 2025-01`,
  )
})

test('changes value', async () => {
  const setTime = mockFunction()
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
  assertDeepEqual(setTime.mock.calls, [[{ year: 2024, month: 3 }]])
})
