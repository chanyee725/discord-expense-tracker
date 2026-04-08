import { test, expect } from '@playwright/test';

test('verify dashboard loads', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1200 });

  await page.goto('http://localhost:3000');

  await page.waitForLoadState('networkidle');

  await expect(page.getByText('이번 달 총 지출').first()).toBeVisible();
  await expect(page.getByText('이번 달 거래 건수').first()).toBeVisible();

  await page.screenshot({ path: 'dashboard.png', fullPage: true });
});
