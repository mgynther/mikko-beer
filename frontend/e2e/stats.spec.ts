import { test, expect, type Page } from '@playwright/test'
import {
  breweryCountry,
  breweryName,
  localUrl,
  locationName,
  reviewContainer,
  reviewYear,
  styleName,
} from './constants'
import { login } from './login'

async function toStats(page: Page): Promise<void> {
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
  await expect(page.getByText(reviewYear)).toBeVisible()
})

test('To annual stats with URL', async ({ page }) => {
  await page.goto(localUrl)
  await login(page)
  await page.getByRole('link', { name: /add review/i }).click()
  await page.goto(`${localUrl}/stats?stats=annual`)
  await expect(page.getByText(reviewYear)).toBeVisible()
})

test('Annual & Container stats', async ({ page }) => {
  await toStats(page)
  await page.getByRole('button', { name: /^annual & container/i }).click()
  // The rows are sorted by year descending and loaded a page at a time, and
  // the review's year is one no other review reaches, so the row is on the
  // first page whatever else the database holds.
  await expect(
    page
      .getByRole('row')
      .filter({ hasText: reviewYear })
      .filter({ hasText: reviewContainer }),
  ).toBeVisible()
})

test('Brewery stats', async ({ page }) => {
  await toStats(page)
  await page.getByRole('button', { name: 'Brewery', exact: true }).click()
  await expect(page.getByText(breweryName)).toBeVisible()
})

test('Brewery country stats', async ({ page }) => {
  await toStats(page)
  await page.getByRole('button', { name: /^brewery country/i }).click()
  await expect(page.getByText(breweryCountry)).toBeVisible()
})

test('Location stats', async ({ page }) => {
  await toStats(page)
  await page.getByRole('button', { name: /^location/i }).click()
  await expect(page.getByText(locationName)).toBeVisible()
})

test('Rating stats', async ({ page }) => {
  await toStats(page)
  await page.getByRole('button', { name: /^rating/i }).click()
  await expect(page.getByText('Count', { exact: true })).toBeVisible()
})

test('Style stats', async ({ page }) => {
  await toStats(page)
  await page.getByRole('button', { name: /^style/i }).click()
  await expect(page.getByText(styleName)).toBeVisible()
})
