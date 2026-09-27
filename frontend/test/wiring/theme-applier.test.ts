import { test } from '../test'
import { assertEqual } from '../assert'

import { applyTheme } from '../../src/wiring/theme-applier'

test('apply dark', async () => {
  applyTheme('DARK')
  const bodyElements = document.getElementsByTagName('body')
  assertEqual(bodyElements[0].getAttribute('class'), null)
})

test('apply light', async () => {
  applyTheme('LIGHT')
  const bodyElements = document.getElementsByTagName('body')
  assertEqual(bodyElements[0].getAttribute('class'), 'light')
})
