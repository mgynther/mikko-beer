import { test, expect } from '@playwright/test'
import { localUrl } from './constants'
import { login } from './login'

test('Style list', async ({ page }) => {
  await page.goto(localUrl)
  await login(page)
  await page.getByRole('button', { name: /^more/i }).click()

  await page.getByRole('link', { name: /styles/i }).click()
  await expect(page.getByRole('heading', { name: 'Styles' })).toBeVisible()
  await page.getByRole('link', { name: /altbier/i }).click()
  await expect(page.getByRole('heading', { name: 'altbier' })).toBeVisible()
})

test('Style search', async ({ page }) => {
  await page.goto(localUrl)
  await login(page)
  await page.getByRole('button', { name: /^more/i }).click()

  await page.getByRole('link', { name: /styles/i }).click()
  await expect(page.getByRole('heading', { name: 'Styles' })).toBeVisible()
  await page.getByRole('textbox', { name: /search style/i }).fill('tripel')
  await page.getByRole('button', { name: /tripel/i }).click()
  await expect(page.getByRole('heading', { name: 'tripel' })).toBeVisible()
})
