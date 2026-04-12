import { expect, test } from "vitest"
import { formatDateString, joinSortedNames, pad, useDebounce } from "./util"
import { render, waitFor } from "@testing-library/react"
import React from "react"
import userEvent from "@testing-library/user-event"

test('pad under 10', () => {
  expect(pad(1)).toEqual('01')
})

test('do not pad 10', () => {
  expect(pad(10)).toEqual('10')
})

test('formatDateString', () => {
  expect(formatDateString('2024-12-10T12:00:00.000Z')).toEqual('2024-12-10')
})

test('joinSortedNames', () => {
  expect(joinSortedNames([
    {
      name: 'one'
    },
    {
      name: 'two'
    }
  ])).toEqual('one, two')
})

function DebounceHelper (): React.JSX.Element {
  const [text, setText] = React.useState('')
  const [debounced] = useDebounce(text, 10)
  return (
    <div>
      <input type='text' value={text} onChange={e => setText(e.target.value)} />
      {debounced}
    </div>
  )
}

test('debounce', async () => {
  const user = userEvent.setup()
  const { getByRole, getByText } = render(
    <DebounceHelper />
  )
  const input = getByRole('textbox')
  input.focus()
  await user.paste('testing')
  await waitFor(() => getByText('testing'))
})
