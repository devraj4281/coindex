import type { Candle, ExchangeRestAdapter } from '../types';

/** Map standardised intervals to Bybit-specific interval codes */
const INTERVAL_MAP: Record<string, string> = {
    '1m': '1', '3m': '3', '5m': '5',
    '15m': '15', '30m': '30',
    '1h': '60', '2h': '120', '4h': '240',
    '6h': '360', '12h': '720',
    '1d': 'D', '1w': 'W', '1M': 'M',
};

/**
 * Bybit REST adapter — server-safe, no browser APIs.
 * Uses the Bybit V5 market kline endpoint which has no US geo-restrictions.
 */
export class BybitRestAdapter implements ExchangeRestAdapter {
    readonly name = 'Bybit';

    private readonly baseUrl = 'https://api.bybit.com/v5/market/kline';

    private toInterval(standard: string): string {
        return INTERVAL_MAP[standard] ?? standard;
    }

    async fetchKlines(symbol: string, interval: string, limit: number): Promise<Candle[]> {
        const bybitInterval = this.toInterval(interval);
        const url =
            `${this.baseUrl}` +
            `?category=linear` +
            `&symbol=${symbol}` +
            `&interval=${bybitInterval}` +
            `&limit=${limit}`;

        const res = await fetch(url, { cache: 'no-store' });

        if (!res.ok) {
            throw new Error(`[Bybit] HTTP ${res.status} for ${symbol}/${interval}`);
        }

        const json = await res.json();

        if (json.retCode !== 0) {
            throw new Error(`[Bybit] API error ${json.retCode}: ${json.retMsg}`);
        }

        // Bybit returns newest-first; reverse so oldest candle is index 0.
        // Each item: [startTime_ms, open, high, low, close, volume, turnover]
        return (json.result.list as string[][]).reverse().map((k) => ({
            time: Math.floor(Number(k[0]) / 1000),
            open: +k[1],
            high: +k[2],
            low: +k[3],
            close: +k[4],
        }));
    }
}
