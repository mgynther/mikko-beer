import { test, expect } from '@playwright/test'
import { localUrl } from './constants'
import { login } from './login'

test('Beer list', async ({ page }) => {
  await page.goto(localUrl)
  await login(page)

  await page.getByRole('link', { name: /beers/i }).click()
  await expect(page.getByRole('heading', { name: 'Beers' })).toBeVisible()
  await expect(page.getByText('100 Nelson Sauvin Ipa')).toBeVisible()
})
