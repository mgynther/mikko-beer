import { test, expect } from '@playwright/test'
import { login } from './login'

test('Search beer from navigation menu', async ({ page }) => {
  await login(page)
  await page.getByRole('button', { name: /^more/i }).click()
  await page
    .getByRole('navigation')
    .getByRole('textbox', { name: /search beer/i })
    .fill('severi')
  await page.getByRole(
    'button',
    { name: /^severin \(koskipanimo\)$/i }
  ).click()
  await expect(page.getByRole('heading', { name: 'Severin' })).toBeVisible()
})

test('Search brewery from navigation menu', async ({ page }) => {
  await login(page)
  await page.getByRole('button', { name: /^more/i }).click()
  await page
    .getByRole('navigation')
    .getByRole('textbox', { name: /search brewery/i })
    .fill('oskipa')
  await page.getByRole('button', { name: /^koskipanimo$/i }).click()
  await expect(page.getByRole('heading', { name: 'Koskipanimo' })).toBeVisible()
})
