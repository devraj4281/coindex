import type { Candle, ExchangeRestAdapter } from '../types';

/** OKX uses uppercase H/D/W suffixes for hours/days/weeks */
const INTERVAL_MAP: Record<string, string> = {
  '1m': '1m',  '3m': '3m',  '5m': '5m',
  '15m': '15m', '30m': '30m',
  '1h': '1H',  '2h': '2H',  '4h': '4H',
  '6h': '6H',  '12h': '12H',
  '1d': '1D',  '1w': '1W',  '1M': '1M',
};

/**
 * OKX REST adapter — server-safe, no geo-restrictions.
 * Uses the OKX V5 market candles endpoint (public, no auth required).
 */
export class OkxRestAdapter implements ExchangeRestAdapter {
  readonly name = 'OKX';

  private readonly baseUrl = 'https://www.okx.com/api/v5/market/candles';

  private toInterval(standard: string): string {
    return INTERVAL_MAP[standard] ?? standard;
  }

  async fetchKlines(symbol: string, interval: string, limit: number): Promise<Candle[]> {
    // OKX candles endpoint maximum is 300
    const safeLimit = Math.min(limit, 300);
    const okxInterval = this.toInterval(interval);

    const url =
      `${this.baseUrl}` +
      `?instId=${symbol}` +
      `&bar=${okxInterval}` +
      `&limit=${safeLimit}`;

    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`[OKX] HTTP ${res.status} for ${symbol}/${interval}`);
    }

    const json = await res.json();

    if (json.code !== '0') {
      throw new Error(`[OKX] API error ${json.code}: ${json.msg}`);
    }

    // OKX returns newest-first; reverse so oldest candle is index 0.
    // Each item: [timestamp_ms, open, high, low, close, vol, volCcy, volCcyQuote, confirm]
    return (json.data as string[][]).reverse().map((k) => ({
      time: Math.floor(Number(k[0]) / 1000),
      open: +k[1],
      high: +k[2],
      low: +k[3],
      close: +k[4],
    }));
  }
}
