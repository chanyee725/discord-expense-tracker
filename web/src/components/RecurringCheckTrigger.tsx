'use client';

import { useEffect } from 'react';
import { checkAndGenerateRecurringAction } from '@/app/(dashboard)/recurring-management/actions';

export default function RecurringCheckTrigger() {
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 0-indexed → 1-indexed

    // Silent check - no UI feedback
    checkAndGenerateRecurringAction(year, month).then((result) => {
      if (!result.success) {
        console.error('Failed to generate recurring transactions:', result.error);
      } else if (result.generated > 0) {
        console.info(`Generated ${result.generated} recurring transactions (${result.skipped} skipped)`);
      }
    }).catch((err) => {
      console.error('Failed to check recurring transactions:', err);
    });
  }, []); // Empty deps - run once on mount

  return null; // No UI
}
