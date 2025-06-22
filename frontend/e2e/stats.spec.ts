import { test, expect, type Page } from '@playwright/test'
import { localUrl, reviewContainer } from './constants'
import { login } from './login'

async function toStats (page: Page): Promise<void> {
  await page.goto(localUrl)
  await login(page)

  await page.getByRole('link', { name: /statistics/i }).click()
  await expect(page.getByRole('heading', { name: 'Statistics' })).toBeVisible()
}

test('Overall stats', async ({ page }) => {
  await toStats(page)
  await expect(page.getByText(/review rating average/i)).toBeVisible()
})

test('Annual stats', async ({ page }) => {
  await toStats(page)
  await page.getByRole('button', { name: 'Annual', exact: true }).click()
  await expect(page.getByText(/2021/i)).toBeVisible()
})

test('To annual stats with URL', async ({ page }) => {
  await page.goto(localUrl)
  await login(page)
  await page.getByRole('link', { name: /add review/i }).click()
  await page.goto(`${localUrl}/stats?stats=annual`)
  await expect(page.getByText(/2021/i)).toBeVisible()
})

test('Annual & Container stats', async ({ page }) => {
  await toStats(page)
  await page.getByRole('button', { name: /^annual & container/i }).click()
  // Note using real current year can cause a failure right after new year if a
  // review has not been created by an e2e test.
  const currentYear = new Date().getUTCFullYear()
  await expect(page
    .getByRole('row')
    .filter({ hasText: `${currentYear}`})
    .filter({ hasText: reviewContainer})
  ).toBeVisible()
})

test('Brewery stats', async ({ page }) => {
  await toStats(page)
  await page.getByRole('button', { name: /^brewery/i }).click()
  await expect(page.getByText(/abbaye de scourmont - chimay/i)).toBeVisible()
})

test('Location stats', async ({ page }) => {
  await toStats(page)
  await page.getByRole('button', { name: /^location/i }).click()
  await expect(page.getByText(/Brewdog, Tampere/i)).toBeVisible()
})

test('Rating stats', async ({ page }) => {
  await toStats(page)
  await page.getByRole('button', { name: /^rating/i }).click()
  await expect(page.getByText(/count/i)).toBeVisible()
})

test('Style stats', async ({ page }) => {
  await toStats(page)
  await page.getByRole('button', { name: /^style/i }).click()
  await expect(page.getByText(/altbier/i)).toBeVisible()
})
