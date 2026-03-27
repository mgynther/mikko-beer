import { expect, test } from 'vitest'

import { applyTheme } from './theme-applier'

test('apply dark', async () => {
  applyTheme('DARK')
  const bodyElements = document.getElementsByTagName('body')
  expect(bodyElements[0].getAttribute('class')).toEqual(null)
})

test('apply light', async () => {
  applyTheme('LIGHT')
  const bodyElements = document.getElementsByTagName('body')
  expect(bodyElements[0].getAttribute('class')).toEqual('light')
})
