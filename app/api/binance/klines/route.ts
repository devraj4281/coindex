import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval') ?? '1m';
  const limit = searchParams.get('limit') ?? '500';

  if (!symbol) {
    return NextResponse.json(
      { error: 'Missing symbol' },
      { status: 400 },
    );
  }

  const binanceUrl =
    `https://api.binance.com/api/v3/klines` +
    `?symbol=${symbol}&interval=${interval}&limit=${limit}`;

  try {
    const res = await fetch(binanceUrl, {
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text },
        { status: res.status },
      );
    }

    const data = await res.json();

  
    return NextResponse.json(data);
  } catch (err) {
    console.error('Binance fetch failed:', err);
    return NextResponse.json(
      { error: 'Binance fetch failed' },
      { status: 500 },
    );
  }
}
