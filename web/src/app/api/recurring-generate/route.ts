import { NextRequest, NextResponse } from 'next/server';
import { generateRecurringTransactions } from '@/lib/queries';

export async function POST(request: NextRequest) {
  // 1. Check API key
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey || apiKey !== process.env.CRON_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    
    const now = new Date();
    const year = body.year ?? now.getFullYear();
    const month = body.month ?? now.getMonth() + 1;
    const day = body.day ?? now.getDate();

    if (
      typeof year !== 'number' ||
      typeof month !== 'number' ||
      typeof day !== 'number' ||
      year < 2000 || year > 2100 ||
      month < 1 || month > 12 ||
      day < 1 || day > 31
    ) {
      return NextResponse.json(
        { error: 'Invalid year, month, or day' },
        { status: 400 }
      );
    }

    const result = await generateRecurringTransactions(year, month, day);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in recurring-generate API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
