import { test, expect } from '@playwright/test';

test('should persist recurring transaction across reload', async ({ page }) => {
  page.on('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.accept();
  });

  // 1. Navigate to page
  await page.goto('http://localhost:3000/recurring-management');
  
  // 2. Click Add button
  await page.getByRole('button', { name: '추가하기' }).click();
  
  // Wait for panel to open
  await expect(page.getByText('지출 편집')).toBeVisible();
  
  // 3. Fill form
  await page.locator('input[type="text"]').fill('테스트구독');
  
  // Amount (second number input)
  // Wait, let's be more specific. Placeholder is "0" for amount.
  await page.getByPlaceholder('0').fill('9900');
  
  // Date (first number input, min 1 max 31)
  // Or placeholder is empty?
  // Let's use the one near "일" text
  await page.locator('input[type="number"]').first().fill('15');
  
  // 4. Click Save
  await page.getByRole('button', { name: '저장하기' }).click();
  
  // 5. Wait for item to appear in list
  // Increase timeout
  await expect(page.getByText('테스트구독')).toBeVisible({ timeout: 10000 });
  
  // 6. Reload page
  await page.reload();
  
  // 7. Verify persistence
  await expect(page.getByText('테스트구독')).toBeVisible();
  await expect(page.getByText('9,900원')).toBeVisible();
  
  // 8. Cleanup (delete the item)
  await page.getByText('테스트구독').click();
  await expect(page.getByText('지출 편집')).toBeVisible();
  
  await page.getByRole('button', { name: '삭제하기' }).click();
  
  // Wait for deletion
  await expect(page.getByText('테스트구독')).not.toBeVisible();
});
