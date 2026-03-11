import { NextResponse } from 'next/server';
import { restAdapter } from '@/lib/exchanges';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval') ?? '1m';
  const limit = parseInt(searchParams.get('limit') ?? '500', 10);

  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol' }, { status: 400 });
  }

  try {
    const candles = await restAdapter.fetchKlines(symbol, interval, limit);
    return NextResponse.json(candles);
  } catch (err) {
    console.error(`[${restAdapter.name}] fetchKlines error:`, err);
    return NextResponse.json(
      { error: `Failed to fetch klines from ${restAdapter.name}` },
      { status: 503 },
    );
  }
}
