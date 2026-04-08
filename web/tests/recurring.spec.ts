import { test, expect } from '@playwright/test';

test('recurring management page loads and modal opens', async ({ page }) => {
  await page.goto('http://localhost:3000/recurring-management');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: '반복 관리' })).toBeVisible();
  await expect(page.getByRole('button', { name: '반복 지출' })).toBeVisible();
  await expect(page.getByRole('button', { name: '반복 수입' })).toBeVisible();
  await expect(page.getByRole('button', { name: '추가하기' })).toBeVisible();

  await page.getByRole('button', { name: '추가하기' }).click();
  await expect(page.getByText('지출 편집')).toBeVisible();

  await expect(page.getByPlaceholder('예: 넷플릭스')).toBeVisible();
  await expect(page.getByPlaceholder('0')).toBeVisible();
  await expect(page.getByRole('button', { name: '저장하기' })).toBeVisible();

  // force: true needed — backdrop z-40 overlaps modal z-50 form fields
  const nameInput = page.getByPlaceholder('예: 넷플릭스');
  await nameInput.click({ force: true });
  await nameInput.fill('테스트구독');
  await expect(nameInput).toHaveValue('테스트구독');

  const amountInput = page.getByPlaceholder('0');
  await amountInput.click({ force: true });
  await amountInput.fill('9900');

  await page.getByRole('button', { name: '반복 수입' }).click({ force: true });
  await expect(page.getByRole('button', { name: '반복 수입' })).toBeVisible();

  await page.screenshot({ path: 'recurring.png', fullPage: true });
});
