import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { restAdapter } from '@/lib/exchanges';

/**
 * Cache TTL in seconds, keyed by candle interval.
 * Shorter-lived candles need more frequent refreshes; longer ones are stable.
 */
const INTERVAL_TTL: Record<string, number> = {
  '1m':  30,
  '3m':  45,
  '5m':  60,
  '15m': 90,
  '30m': 120,
  '1h':  300,
  '2h':  300,
  '4h':  600,
  '6h':  600,
  '12h': 600,
  '1d':  300,
  '1w':  600,
  '1M':  600,
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const symbol   = searchParams.get('symbol');
  const interval = searchParams.get('interval') ?? '1m';
  const limit    = parseInt(searchParams.get('limit') ?? '500', 10);

  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol' }, { status: 400 });
  }

  const ttl = INTERVAL_TTL[interval] ?? 60;

  try {
    // unstable_cache deduplicates and revalidates server-side based on the key.
    // Each unique [symbol, interval, limit] combination gets its own cache entry.
    const fetchCached = unstable_cache(
      () => restAdapter.fetchKlines(symbol, interval, limit),
      [symbol, interval, String(limit)],
      {
        revalidate: ttl,
        tags: [`klines`, `klines-${symbol}`, `klines-${symbol}-${interval}`],
      },
    );

    const candles = await fetchCached();

    return NextResponse.json(candles, {
      headers: {
        // CDN (Vercel Edge) caches for `ttl` seconds and serves stale for 10s while revalidating.
        'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=10`,
      },
    });
  } catch (err) {
    console.error(`[${restAdapter.name}] fetchKlines error:`, err);
    return NextResponse.json(
      { error: `Failed to fetch klines from ${restAdapter.name}` },
      { status: 503 },
    );
  }
}
