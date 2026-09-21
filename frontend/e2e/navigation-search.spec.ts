import { test, expect } from '@playwright/test'
import { login } from './login'
import {
  beerName,
  beerOption,
  beerSearch,
  breweryName,
  breweryOption,
  brewerySearch,
} from './constants'

test('Search beer from navigation menu', async ({ page }) => {
  await login(page)
  await page.getByRole('button', { name: /^more/i }).click()
  await page
    .getByRole('navigation')
    .getByRole('combobox', { name: /search beer/i })
    .fill(beerSearch)
  await page.getByRole('option', { name: beerOption }).click()
  await expect(page.getByRole('heading', { name: beerName })).toBeVisible()
})

test('Search brewery from navigation menu', async ({ page }) => {
  await login(page)
  await page.getByRole('button', { name: /^more/i }).click()
  await page
    .getByRole('navigation')
    .getByRole('combobox', { name: /search brewery/i })
    .fill(brewerySearch)
  await page.getByRole('option', { name: breweryOption }).click()
  await expect(page.getByRole('heading', { name: breweryName })).toBeVisible()
})
