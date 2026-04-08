import { test, expect } from '@playwright/test';

test('verify dashboard charts', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1200 });

  await page.goto('http://localhost:3002');

  await page.waitForLoadState('networkidle');
  
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'dashboard.png', fullPage: true });

  const dailyChart = page.locator('.recharts-bar-rectangles');
  await expect(dailyChart.first()).toBeVisible();

  await expect(page.locator('body')).toContainText('편의점·마트·잡화');
  const pieChart = page.locator('.recharts-pie');
  await expect(pieChart.first()).toBeVisible();

  await expect(page.locator('body')).toContainText('월별 수입/지출 추이');
  await expect(page.locator('body')).toContainText('2월');

  await expect(page.locator('body')).toContainText('3,600');
});
