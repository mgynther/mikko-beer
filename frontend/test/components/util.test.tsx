import { test } from '../test'
import { assertEqual } from '../assert'
import { render, waitFor } from '../render'
import {
  formatDateString,
  joinSortedNames,
  pad,
  useDebounce,
} from '../../src/components/util'
import React from 'react'
import { setupUser } from '../user-event'

test('pad under 10', () => {
  assertEqual(pad(1), '01')
})

test('do not pad 10', () => {
  assertEqual(pad(10), '10')
})

test('formatDateString', () => {
  assertEqual(formatDateString('2024-12-10T12:00:00.000Z'), '2024-12-10')
})

test('joinSortedNames', () => {
  assertEqual(
    joinSortedNames([
      {
        name: 'one',
      },
      {
        name: 'two',
      },
    ]),
    'one, two',
  )
})

function DebounceHelper(): React.JSX.Element {
  const [text, setText] = React.useState('')
  const [debounced] = useDebounce(text, 10)
  return (
    <div>
      <input
        type='text'
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {debounced}
    </div>
  )
}

test('debounce', async () => {
  const user = setupUser()
  const { getByRole, getByText } = render(<DebounceHelper />)
  const input = getByRole('textbox')
  input.focus()
  await user.paste('testing')
  await waitFor(() => getByText('testing'))
})
